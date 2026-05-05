import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./viewProformaModal.css";

import { getProformaById, descargarProformaPdf } from "../services/proformaService";

const ESTADO_COLORS = {
  EMITIDA: { bg: "#e3f2fd", color: "#1565c0" },
  ACEPTADA: { bg: "#e8f5e9", color: "#2e7d32" },
  ANULADA: { bg: "#ffebee", color: "#c62828" },
};

export default function ViewProformaModal({ isOpen, onClose, proformaId }) {
  const [proforma, setProforma] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !proformaId) return;

    const cargar = async () => {
      setLoading(true);
      try {
        const resp = await getProformaById(proformaId);
        setProforma(resp.data);
      } catch (error) {
        console.error("Error cargando proforma", error);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [isOpen, proformaId]);

  const handleDescargarPdf = async () => {
    try {
      await descargarProformaPdf(proformaId);
    } catch (error) {
      console.error("Error descargando PDF", error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString("es-EC");
  };

  if (!isOpen) return null;

  const estadoStyle = proforma
    ? ESTADO_COLORS[proforma.estado] || { bg: "#eee", color: "#333" }
    : {};

  return createPortal(
    <div className="view-proforma-overlay">
      <div className="view-proforma-modal">
        {loading ? (
          <p style={{ textAlign: "center", padding: 40 }}>Cargando...</p>
        ) : !proforma ? (
          <p style={{ textAlign: "center", padding: 40 }}>
            No se encontró la proforma.
          </p>
        ) : (
          <>
            <h2>Detalle de Proforma</h2>
            <p className="proforma-numero">
              {proforma.numeroProforma} &nbsp;
              <span
                style={{
                  background: estadoStyle.bg,
                  color: estadoStyle.color,
                  padding: "3px 12px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {proforma.estado}
              </span>
            </p>

            {/* ========== INFO CARDS ========== */}
            <div className="info-grid">
              {/* Cliente */}
              <div className="info-card">
                <h4>👤 Cliente</h4>
                {proforma.cliente ? (
                  <>
                    <p>
                      <strong>
                        {proforma.cliente.nombres}{" "}
                        {proforma.cliente.apellidosRazonSocial}
                      </strong>
                    </p>
                    <p>{proforma.cliente.identificacion}</p>
                    <p>{proforma.cliente.email}</p>
                    <p>{proforma.cliente.telefono}</p>
                  </>
                ) : (
                  <p>Cliente ID: {proforma.clienteId}</p>
                )}
              </div>

              {/* Fechas */}
              <div className="info-card">
                <h4>📅 Fechas</h4>
                <p>
                  <strong>Emisión:</strong>{" "}
                  {formatDate(proforma.fechaEmision)}
                </p>
                <p>
                  <strong>Validez:</strong>{" "}
                  {formatDate(proforma.fechaValidez)}
                </p>
                <p>
                  <strong>Creado:</strong>{" "}
                  {new Date(proforma.creadoEn).toLocaleString("es-EC")}
                </p>
              </div>
            </div>

            {/* ========== DETALLES ========== */}
            <table className="detalle-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto / Servicio</th>
                  <th>Cantidad</th>
                  <th className="text-right">P. Unitario</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {proforma.detalles &&
                  proforma.detalles.map((d, i) => (
                    <tr key={d.id || i}>
                      <td>{i + 1}</td>
                      <td>ID: {d.productoServicioId}</td>
                      <td>{d.cantidad}</td>
                      <td className="text-right">
                        ${parseFloat(d.precioUnitario).toFixed(2)}
                      </td>
                      <td className="text-right">
                        ${parseFloat(d.subtotal || d.cantidad * d.precioUnitario).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* ========== TOTALES ========== */}
            <div className="totales-view">
              <div className="totales-view-box">
                <div className="total-row">
                  <span>Subtotal sin IVA:</span>
                  <span>${parseFloat(proforma.subtotalSinIva).toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Descuento ({proforma.porcentajeDescuento}%):</span>
                  <span>
                    -${parseFloat(proforma.totalDescuento).toFixed(2)}
                  </span>
                </div>
                <div className="total-row">
                  <span>IVA:</span>
                  <span>${parseFloat(proforma.totalIva).toFixed(2)}</span>
                </div>
                <div className="total-row final">
                  <span>TOTAL:</span>
                  <span>${parseFloat(proforma.totalFinal).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* ========== OBSERVACIONES ========== */}
            {proforma.observaciones && (
              <div className="observaciones-box">
                <strong>Observaciones:</strong> {proforma.observaciones}
              </div>
            )}

            {/* ========== FOOTER ========== */}
            <div className="modal-footer">
              <button className="btn-pdf" onClick={handleDescargarPdf}>
                📄 Descargar PDF
              </button>
              <button className="btn-close-view" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
