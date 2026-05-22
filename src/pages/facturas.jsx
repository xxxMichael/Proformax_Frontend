import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Table from "../components/Table";
import FacturaModal from "../components/FacturaModal";
import ViewFacturaModal from "../components/ViewFacturaModal";
import { getFacturas } from "../services/facturaService";
import { getProveedores } from "../services/supplierService";
import toast from "react-hot-toast";

import "./facturas.css";

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFacturas();
    loadProveedores();
  }, []);

  const loadFacturas = async () => {
    setLoading(true);
    try {
      const resp = await getFacturas(1, 100, filtroProveedor);
      setFacturas(resp.data || []);
    } catch (error) {
      console.error("Error cargando facturas", error);
      toast.error("Error al cargar facturas");
    } finally {
      setLoading(false);
    }
  };

  const loadProveedores = async () => {
    try {
      const resp = await getProveedores(1, 100, "");
      setProveedores(resp.data || []);
    } catch (e) {
      console.error("Error cargando proveedores", e);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setFiltroProveedor("");
    setTimeout(() => loadFacturas(), 0);
  };

  const handleFilterByProveedor = (e) => {
    setFiltroProveedor(e.target.value);
    setTimeout(() => loadFacturas(), 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  // Filtrado local por búsqueda de texto
  const filteredFacturas = facturas.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const provNombre = f.proveedor?.razonSocial?.toLowerCase() || "";
    const numFactura = f.numeroFactura?.toLowerCase() || "";
    return provNombre.includes(q) || numFactura.includes(q);
  });

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="facturas-content">
          {/* ========== BARRA DE HERRAMIENTAS ========== */}
          <div className="premium-filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar por número de factura o proveedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="filter-select-premium"
              value={filtroProveedor}
              onChange={handleFilterByProveedor}
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.razonSocial}
                </option>
              ))}
            </select>

            <button className="btn-clear-filters" onClick={handleClearFilters}>
              🗑️ Limpiar filtros
            </button>

            <div className="spacer"></div>

            <button
              className="btn-create-new"
              onClick={() => setIsModalOpen(true)}
            >
              <span>+</span> Nueva Factura
            </button>
          </div>

          {/* ========== TABLA ========== */}
          <Table
            headers={[
              "#",
              "Nº Factura",
              "Proveedor",
              "Fecha Emisión",
              "Total",
              "Ítems",
              "Acciones",
            ]}
            rows={filteredFacturas.map((f, i) => [
              i + 1,
              <strong key={`num-${f.id}`}>{f.numeroFactura}</strong>,
              <div key={`prov-${f.id}`} className="factura-proveedor">
                <strong>
                  {f.proveedor?.razonSocial || `Proveedor #${f.proveedorId}`}
                </strong>
                <span>{f.proveedor?.identificacion || ""}</span>
              </div>,
              formatDate(f.fechaEmision),
              <span key={`total-${f.id}`} className="factura-total">
                ${Number(f.total || 0).toFixed(2)}
              </span>,
              <span key={`items-${f.id}`} className="badge-items">
                {(f.lineas || f.items || f.detalles || []).length} ítems
              </span>,
            ])}
            loading={loading}
            itemsPerPage={6}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onView={(index) => {
              setSelectedFactura(filteredFacturas[index]);
              setIsViewModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* MODAL: Nueva Factura (Analizar + Confirmar) */}
      <FacturaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadFacturas}
      />

      {/* MODAL: Ver Factura */}
      <ViewFacturaModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        facturaId={selectedFactura?.id}
      />
    </div>
  );
}
