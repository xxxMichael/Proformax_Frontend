import { createPortal } from "react-dom";
import { User, X, Tag, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import "./ViewModal.css";

export default function ViewModal({ isOpen, onClose, cliente }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="view-modal-overlay">
      <div className="view-modal-premium">
        <div className="view-modal-header">
          <div className="view-header-content">
            <div className="view-header-icon">
              <User size={28} />
            </div>
            <div className="view-header-text">
              <h2>Detalle del Cliente</h2>
              <p className="view-header-sub">Información personal y de facturación</p>
            </div>
          </div>
          <button className="btn-close-view-premium" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="view-modal-body">
          {!cliente ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>No hay información para mostrar.</p>
          ) : (
            <div className="view-details-grid">
              <div className="view-detail-row">
                <Tag className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Identificación (RUC/CED)</div>
                  <div className="view-detail-value"><strong>{cliente.identificacion}</strong></div>
                </div>
              </div>

              <div className="view-detail-row">
                <User className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Nombre / Razón Social</div>
                  <div className="view-detail-value" style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a" }}>
                    {cliente.nombres} {cliente.apellidosRazonSocial}
                  </div>
                </div>
              </div>

              <div className="view-detail-row">
                <Phone className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Teléfono de Contacto</div>
                  <div className="view-detail-value">{cliente.telefono}</div>
                </div>
              </div>

              <div className="view-detail-row">
                <Mail className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Correo Electrónico</div>
                  <div className="view-detail-value" style={{ color: "#2563eb" }}>{cliente.email}</div>
                </div>
              </div>

              <div className="view-detail-row">
                <MapPin className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Dirección</div>
                  <div className="view-detail-value" style={{ color: "#475569" }}>
                    {cliente.direccion || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin dirección</span>}
                  </div>
                </div>
              </div>

              <div className="view-detail-row">
                <CheckCircle2 className="view-detail-icon" style={{ color: "#16a34a" }} />
                <div className="view-detail-info">
                  <div className="view-detail-label">Estado en Sistema</div>
                  <div className="view-detail-value">
                    <span className="view-status-badge activo">ACTIVO</span>
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