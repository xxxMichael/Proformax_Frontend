import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Truck, Package } from "lucide-react";
import { getFacturaById } from "../services/facturaService";
import "./viewFacturaModal.css";

export default function ViewFacturaModal({ isOpen, onClose, facturaId }) {
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && facturaId) {
      const cargar = async () => {
        setLoading(true);
        try {
          const resp = await getFacturaById(facturaId);
          setFactura(resp.data || resp);
        } catch (e) {
          console.error("Error cargando factura", e);
        } finally {
          setLoading(false);
        }
      };
      cargar();
    }
  }, [isOpen, facturaId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="view-factura-overlay">
      <div className="view-factura-modal">
        {/* HEADER */}
        <div className="view-factura-header">
          <div className="view-factura-header-left">
            <div className="view-factura-header-icon">
              <FileText size={22} />
            </div>
            <div>
              <h2>Detalle de Factura</h2>
              <span>{factura?.numeroFactura || "Cargando..."}</span>
            </div>
          </div>
          <button className="btn-close-minimal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="view-factura-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
              <div className="spinner-inline" style={{ margin: "0 auto 10px", borderColor: "#cbd5e1", borderTopColor: "#2563eb" }} />
              Cargando factura...
            </div>
          ) : factura ? (
            <>
              {/* Info General */}
              <div className="vf-info-grid">
                <div className="vf-info-card">
                  <label>Nº Factura</label>
                  <div className="value">{factura.numeroFactura}</div>
                </div>
                <div className="vf-info-card">
                  <label>Fecha Emisión</label>
                  <div className="value">{formatDate(factura.fechaEmision)}</div>
                </div>
                <div className="vf-info-card full-width">
                  <label><Truck size={12} style={{ marginRight: 4 }} /> Proveedor</label>
                  <div className="value">
                    {factura.proveedor
                      ? `${factura.proveedor.razonSocial} (${factura.proveedor.identificacion})`
                      : `Proveedor ID: ${factura.proveedorId}`}
                  </div>
                </div>
              </div>

              {/* Líneas de Detalle */}
              <div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}>
                  <Package size={14} /> Líneas de Detalle
                </div>
                <table className="vf-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>P. Unitario</th>
                      <th>Total</th>
                      <th>Producto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(factura.lineas || factura.items || factura.detalles || []).map(
                      (item, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{item.descripcion || "—"}</td>
                          <td>{item.cantidad}</td>
                          <td>${Number(item.precioUnitario || 0).toFixed(2)}</td>
                          <td>
                            <strong>
                              ${Number(item.totalItem || item.total || 0).toFixed(2)}
                            </strong>
                          </td>
                          <td>
                            {item.producto ? (
                              <span className="vf-product-tag">
                                {item.producto.nombre}
                              </span>
                            ) : item.productoId ? (
                              <span className="vf-product-tag">
                                ID: {item.productoId}
                              </span>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: 11 }}>
                                Sin vincular
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="vf-totals">
                <div className="vf-total-row grand-total">
                  <span>Total</span>
                  <span>${Number(factura.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
              No se pudo cargar la factura.
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="view-factura-footer">
          <button className="btn-close-view-factura" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
