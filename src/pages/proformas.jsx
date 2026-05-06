import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Table from "../components/Table";
import ProformaModal from "../components/ProformaModal";
import ViewProformaModal from "../components/ViewProformaModal";
import StatusModal from "../components/StatusModal";
import { getProformas, getProformaById } from "../services/proformaService";
import { RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

import "./proformas.css";

export default function Proformas() {
  const [proformas, setProformas] = useState([]);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedProforma, setSelectedProforma] = useState(null);
  const [editingProforma, setEditingProforma] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProformas();
  }, [estado]);

  const loadProformas = async () => {
    setLoading(true);
    try {
      const resp = await getProformas(1, 100, search, estado);
      setProformas(resp.data || []);
    } catch (error) {
      console.error("Error cargando proformas", error);
      toast.error("Error al cargar proformas");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setEstado("");
    setTimeout(() => loadProformas(), 0);
  };

  const formatLocalDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const handleAction = async (index, type) => {
    const proforma = proformas[index];
    if (!proforma) return;

    if (type === "view") {
      setSelectedProforma(proforma);
      setIsViewModalOpen(true);
    } else if (type === "edit") {
      if (proforma.estado !== "EMITIDA") {
        return toast.error("Solo se pueden editar proformas EMITIDAS");
      }
      try {
        const resp = await getProformaById(proforma.id);
        setEditingProforma(resp.data ?? resp);
      } catch {
        toast.error("No se pudo cargar la proforma para editar");
        return;
      }
      setIsModalOpen(true);
    } else if (type === "status") {
      setSelectedProforma(proforma);
      setIsStatusModalOpen(true);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="proformas-content">

          {/* ========== BARRA DE HERRAMIENTAS ========== */}
          <div className="premium-filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar por número o cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && loadProformas()}
              />
            </div>

            <select
              className="filter-select-premium"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="EMITIDA">EMITIDA</option>
              <option value="ACEPTADA">ACEPTADA</option>
              <option value="ANULADA">ANULADA</option>
            </select>

            <button className="btn-clear-filters" onClick={handleClearFilters}>
              🗑️ Limpiar filtros
            </button>

            <div className="spacer"></div>

            <button
              className="btn-create-new"
              onClick={() => { setEditingProforma(null); setIsModalOpen(true); }}
            >
              <span>+</span> Nueva Proforma
            </button>
          </div>

          {/* ========== TABLA ========== */}
          <Table
            headers={["#", "Número", "Cliente", "Fecha Emisión", "Total", "Estado", "Acciones"]}
            rows={proformas.map((p, i) => [
              i + 1,
              p.numeroProforma,
              p.cliente
                ? `${p.cliente.nombres} ${p.cliente.apellidosRazonSocial}`
                : "N/A",
              formatLocalDate(p.fechaEmision),
              <strong key={p.id}>${Number(p.totalFinal || 0).toFixed(2)}</strong>,
              <span
                key={p.id + "_st"}
                className={`status-badge ${p.estado.toLowerCase()}`}
              >
                {p.estado}
              </span>,
            ])}
            loading={loading}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onView={(idx) => handleAction(idx, "view")}
            onEdit={(idx) => handleAction(idx, "edit")}
            onCustomAction={(idx) => handleAction(idx, "status")}
            customActionIcon={<RefreshCcw size={16} />}
            customActionTitle="Cambiar estado"
          />
        </div>
      </div>

      <ProformaModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProforma(null); }}
        onSuccess={loadProformas}
        editingProforma={editingProforma}
      />

      <ViewProformaModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        proformaId={selectedProforma?.id}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        proforma={selectedProforma}
        onSuccess={loadProformas}
      />
    </div>
  );
}
