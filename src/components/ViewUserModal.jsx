import { createPortal } from "react-dom";
import { UserCheck, X, Tag, Shield, Calendar, CheckCircle2 } from "lucide-react";
import "./ViewModal.css";

export default function ViewUserModal({ isOpen, onClose, usuario }) {
  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return createPortal(
    <div className="view-modal-overlay">
      <div className="view-modal-premium">
        <div className="view-modal-header">
          <div className="view-header-content">
            <div className="view-header-icon">
              <UserCheck size={28} />
            </div>
            <div className="view-header-text">
              <h2>Detalle del Usuario</h2>
              <p className="view-header-sub">Información de credenciales y permisos</p>
            </div>
          </div>
          <button className="btn-close-view-premium" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="view-modal-body">
          {!usuario ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>No hay información para mostrar.</p>
          ) : (
            <div className="view-details-grid">
              <div className="view-detail-row">
                <Tag className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">ID de Usuario</div>
                  <div className="view-detail-value"><strong>#{usuario.id}</strong></div>
                </div>
              </div>

              <div className="view-detail-row">
                <UserCheck className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Nombre de Usuario (Username)</div>
                  <div className="view-detail-value" style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                    {usuario.username}
                  </div>
                </div>
              </div>

              <div className="view-detail-row">
                <Shield className="view-detail-icon" style={{ color: usuario.rol === "ADMIN" ? "#7c3aed" : "#2563eb" }} />
                <div className="view-detail-info">
                  <div className="view-detail-label">Rol de Acceso</div>
                  <div className="view-detail-value">
                    <span className="view-type-badge" style={usuario.rol === "ADMIN" ? { background: "#f3e8ff", color: "#6b21a8", borderColor: "#e9d5ff" } : {}}>
                      {usuario.rol}
                    </span>
                  </div>
                </div>
              </div>

              <div className="view-detail-row">
                <Calendar className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Fecha de Creación</div>
                  <div className="view-detail-value" style={{ color: "#475569" }}>
                    {formatDate(usuario.creadoEn)}
                  </div>
                </div>
              </div>

              <div className="view-detail-row">
                <Calendar className="view-detail-icon" style={{ color: "#94a3b8" }} />
                <div className="view-detail-info">
                  <div className="view-detail-label">Última Actualización</div>
                  <div className="view-detail-value" style={{ color: "#64748b", fontSize: "14px" }}>
                    {formatDate(usuario.actualizadoEn)}
                  </div>
                </div>
              </div>

              <div className="view-detail-row">
                <CheckCircle2 className="view-detail-icon" style={{ color: usuario.estado ? "#16a34a" : "#dc2626" }} />
                <div className="view-detail-info">
                  <div className="view-detail-label">Estado en Sistema</div>
                  <div className="view-detail-value">
                    <span className={`view-status-badge ${usuario.estado ? "activo" : "inactivo"}`}>
                      {usuario.estado ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="view-modal-footer">
          <button className="btn-close-footer" onClick={onClose}>Cerrar Detalle</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
