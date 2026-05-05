import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import ProformaModal from "../components/ProformaModal";
import ViewProformaModal from "../components/ViewProformaModal";
import Table from "../components/Table";

import {
  getProformas,
  getProformaById,
  createProforma,
  updateProforma,
  cambiarEstadoProforma,
} from "../services/proformaService";

import "./proformas.css";

const ESTADOS_FILTRO = [
  { value: "", label: "Todos los estados" },
  { value: "EMITIDA", label: "Emitida" },
  { value: "ACEPTADA", label: "Aceptada" },
  { value: "ANULADA", label: "Anulada" },
];

export default function Proformas() {
  const [proformas, setProformas] = useState([]);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [openNewModal, setOpenNewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEstadoModal, setOpenEstadoModal] = useState(false);

  const [page, setPage] = useState(1);
  const [proformaSeleccionada, setProformaSeleccionada] = useState(null);

  // Estado del modal de cambio de estado
  const [nuevoEstado, setNuevoEstado] = useState("ACEPTADA");
  const [observacionesEstado, setObservacionesEstado] = useState("");

  // Helper para formatear fechas sin error de zona horaria
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString("es-EC");
  };

  useEffect(() => {
    loadProformas();
  }, []);

  const loadProformas = async () => {
    try {
      const resp = await getProformas(1, 50, search, filtroEstado);
      setProformas(resp.data);
    } catch (error) {
      console.error("Error cargando proformas", error);
    }
  };

  // 👁‍🗨 VER DETALLE
  const abrirVer = (proforma) => {
    setProformaSeleccionada(proforma);
    setOpenViewModal(true);
  };

  // 🟡 EDITAR (solo EMITIDA)
  const abrirEditar = async (proforma) => {
    if (proforma.estado !== "EMITIDA") {
      toast.error("Solo se pueden editar proformas en estado EMITIDA");
      return;
    }
    
    // Cargamos la proforma completa (con detalles) antes de abrir el modal
    try {
      const resp = await getProformaById(proforma.id);
      setProformaSeleccionada(resp.data);
      setOpenEditModal(true);
    } catch (e) {
      toast.error("Error al cargar los detalles de la proforma");
    }
  };

  // 🔄 CAMBIAR ESTADO (solo EMITIDA)
  const abrirCambioEstado = (proforma) => {
    if (proforma.estado !== "EMITIDA") {
      toast.error("Esta proforma ya no puede cambiar de estado");
      return;
    }
    setProformaSeleccionada(proforma);
    setNuevoEstado("ACEPTADA");
    setObservacionesEstado("");
    setOpenEstadoModal(true);
  };

  const handleCambiarEstado = async () => {
    try {
      await cambiarEstadoProforma(
        proformaSeleccionada.id,
        nuevoEstado,
        observacionesEstado
      );
      toast.success(`Proforma ${nuevoEstado.toLowerCase()} exitosamente`);
      setOpenEstadoModal(false);
      loadProformas();
    } catch (error) {
      console.error("Error cambiando estado", error);
      toast.error("Error al cambiar el estado de la proforma");
    }
  };

  // 🟢 CREAR
  const handleCreate = async (data) => {
    try {
      await createProforma(data);
      toast.success("Proforma creada exitosamente");
      setOpenNewModal(false);
      loadProformas();
    } catch (error) {
      console.error("Error creando proforma", error);
      toast.error(error.response?.data?.message || "Error al crear la proforma");
    }
  };

  // 🔵 EDITAR
  const handleEdit = async (data) => {
    try {
      await updateProforma(proformaSeleccionada.id, data);
      toast.success("Proforma actualizada exitosamente");
      setOpenEditModal(false);
      loadProformas();
    } catch (error) {
      console.error("Error actualizando proforma", error);
      toast.error(error.response?.data?.message || "Error al actualizar la proforma");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setFiltroEstado("");
    // Usamos setTimeout para asegurar que los estados se actualicen antes de cargar
    setTimeout(() => loadProformas(), 0);
  };

  // Badge de estado con color
  const renderEstadoBadge = (estado) => (
    <span className={`badge-estado ${estado}`}>{estado}</span>
  );

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="proformas-content">

          {/* ========== BARRA DE HERRAMIENTAS PREMIUM ========== */}
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

            <div className="filter-select-group">
              <label>Estado:</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                {ESTADOS_FILTRO.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn-clear-filters" onClick={handleClearFilters}>
              🗑️ Limpiar filtros
            </button>

            <div className="spacer"></div>

            <button className="btn-create-new" onClick={() => setOpenNewModal(true)}>
              <span>+</span> Nueva Proforma
            </button>
          </div>

          {/* 🧠 TABLA */}
          <Table
            headers={[
              "#",
              "Nro. Proforma",
              "Fecha Emisión",
              "Validez",
              "Estado",
              "Subtotal",
              "Total",
              "Acciones",
            ]}
            rows={proformas.map((p, i) => [
              i + 1,
              p.numeroProforma,
              formatDate(p.fechaEmision),
              formatDate(p.fechaValidez),
              renderEstadoBadge(p.estado),
              `$${parseFloat(p.subtotalSinIva).toFixed(2)}`,
              `$${parseFloat(p.totalFinal).toFixed(2)}`,
            ])}
            itemsPerPage={6}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onView={(index) => abrirVer(proformas[index])}
            onEdit={(index) => abrirEditar(proformas[index])}
            onCustomAction={(index) => abrirCambioEstado(proformas[index])}
            customActionIcon="ESTADO"
            customActionTitle="Cambiar el estado de la proforma"
          />

        </div>
      </div>

      {/* 🟢 MODAL NUEVO */}
      <ProformaModal
        isOpen={openNewModal}
        onClose={() => setOpenNewModal(false)}
        mode="create"
        onSave={handleCreate}
      />

      {/* 🔵 EDITAR */}
      <ProformaModal
        isOpen={openEditModal}
        onClose={() => setOpenEditModal(false)}
        mode="edit"
        initialData={proformaSeleccionada}
        onSave={handleEdit}
      />

      {/* 👁‍🗨 VER DETALLE */}
      <ViewProformaModal
        isOpen={openViewModal}
        onClose={() => setOpenViewModal(false)}
        proformaId={proformaSeleccionada?.id}
      />

      {/* 🔄 MODAL CAMBIO DE ESTADO */}
      {openEstadoModal && (
        <div className="estado-modal-overlay">
          <div className="estado-modal-card">
            <h2>Cambiar Estado</h2>
            <p className="estado-info">
              Esta proforma pasará de <strong>EMITIDA</strong> a:
            </p>

            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              style={{ width: "100%", height: "45px", fontSize: "16px", marginBottom: "15px" }}
            >
              <option value="ACEPTADA">✅ ACEPTADA (Venta Cerrada)</option>
              <option value="ANULADA">❌ ANULADA (Cancelada)</option>
            </select>

            <label>Observaciones (opcional):</label>
            <textarea
              value={observacionesEstado}
              onChange={(e) => setObservacionesEstado(e.target.value)}
              placeholder="Motivo del cambio de estado..."
            />

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setOpenEstadoModal(false)}
              >
                Cancelar
              </button>
              <button
                className={`btn-confirm-estado ${
                  nuevoEstado === "ACEPTADA" ? "aceptar" : "anular"
                }`}
                onClick={handleCambiarEstado}
              >
                {nuevoEstado === "ACEPTADA"
                  ? "Aceptar Proforma"
                  : "Anular Proforma"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}