import { createPortal } from "react-dom";
import { Package, X, Tag, DollarSign, Hash, CheckCircle2, XCircle, Info, Layers } from "lucide-react";
import "./ViewModal.css";

const TIPO_LABELS = {
  producto: "Producto",
  servicio: "Servicio",
  material: "Material",
  acabado: "Acabado",
  accesorio: "Accesorio",
};

export default function ViewProductModal({ isOpen, onClose, producto }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="view-modal-overlay">
      <div className="view-modal-premium">
        <div className="view-modal-header">
          <div className="view-header-content">
            <div className="view-header-icon">
              <Package size={28} />
            </div>
            <div className="view-header-text">
              <h2>Detalle del Producto</h2>
              <p className="view-header-sub">Ficha técnica y estado del catálogo</p>
            </div>
          </div>
          <button className="btn-close-view-premium" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="view-modal-body">
          {!producto ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>No hay información para mostrar.</p>
          ) : (
            <div className="view-details-grid">
              <div className="view-detail-row">
                <Tag className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Código</div>
                  <div className="view-detail-value"><strong>{producto.codigo}</strong></div>
                </div>
              </div>

              <div className="view-detail-row">
                <Package className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Nombre</div>
                  <div className="view-detail-value">{producto.nombre}</div>
                </div>
              </div>

              <div className="view-detail-row">
                <Layers className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Tipo</div>
                  <div className="view-detail-value">
                    <span className="view-type-badge">{TIPO_LABELS[producto.tipo?.toLowerCase()] || producto.tipo}</span>
                  </div>
                </div>
              </div>

              <div className="view-detail-row">
                <DollarSign className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Precio Base</div>
                  <div className="view-detail-value" style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>
                    ${parseFloat(producto.precioBase).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="view-detail-row">
                <Hash className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Stock Actual</div>
                  <div className="view-detail-value">
                    {producto.tipo?.toLowerCase() === "servicio" ? (
                      <span style={{ color: "#94a3b8" }}>No aplica (Servicio)</span>
                    ) : (
                      <strong>{producto.stockActual} unidades</strong>
                    )}
                  </div>
                </div>
              </div>

              <div className="view-detail-row">
                {producto.aplicaIva ? <CheckCircle2 className="view-detail-icon" style={{ color: "#16a34a" }} /> : <XCircle className="view-detail-icon" style={{ color: "#dc2626" }} />}
                <div className="view-detail-info">
                  <div className="view-detail-label">Aplica IVA</div>
                  <div className="view-detail-value">{producto.aplicaIva ? "Sí (Gravado)" : "No (Exento)"}</div>
                </div>
              </div>

              <div className="view-detail-row">
                <Info className="view-detail-icon" />
                <div className="view-detail-info">
                  <div className="view-detail-label">Descripción</div>
                  <div className="view-detail-value" style={{ color: "#475569" }}>
                    {producto.descripcion || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin descripción</span>}
                  </div>
                </div>
              </div>

              <div className="view-detail-row">
                <CheckCircle2 className="view-detail-icon" style={{ color: producto.estado ? "#16a34a" : "#dc2626" }} />
                <div className="view-detail-info">
                  <div className="view-detail-label">Estado</div>
                  <div className="view-detail-value">
                    <span className={`view-status-badge ${producto.estado ? "activo" : "inactivo"}`}>
                      {producto.estado ? "ACTIVO" : "INACTIVO"}
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
