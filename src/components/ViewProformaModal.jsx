import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer } from "lucide-react";
import "./viewProformaModal.css";
import { getProformaById } from "../services/proformaService";
import { getClienteById } from "../services/clientService";
import toast from "react-hot-toast";

export default function ViewProformaModal({ isOpen, onClose, proformaId }) {
  const [proforma, setProforma] = useState(null);
  const [clienteFull, setClienteFull] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && proformaId) {
      cargarTodo();
    } else {
      setProforma(null);
      setClienteFull(null);
    }
  }, [isOpen, proformaId]);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const respP = await getProformaById(proformaId);
      const pData = respP.data || respP;
      setProforma(pData);

      if (pData.clienteId) {
        try {
          const respC = await getClienteById(pData.clienteId);
          setClienteFull(respC.data || respC);
        } catch (errC) { console.error(errC); }
      }
    } catch (error) {
      toast.error("Error al cargar el detalle");
    } finally {
      setLoading(false);
    }
  };

  const formatLocalDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  if (!isOpen) return null;

  const clienteDisplay = {
    nombreCompleto: proforma?.cliente ? `${proforma.cliente.nombres} ${proforma.cliente.apellidosRazonSocial}` : "N/A",
    identificacion: clienteFull?.identificacion || proforma?.cliente?.identificacion || "No registrado",
    email: clienteFull?.email || proforma?.cliente?.email || "No registrado"
  };

  return createPortal(
    <div className="view-proforma-overlay">
      <div className="view-proforma-container">
        {loading ? (
          <div className="loader-container">Cargando...</div>
        ) : proforma && (
          <>
            <div className="view-modal-header">
              <div className="header-title">
                <h2>Detalle de Proforma</h2>
                <span className={`status-badge ${proforma.estado.toLowerCase()}`}>{proforma.estado}</span>
              </div>
              <button className="btn-close-view" onClick={onClose}><X size={24} /></button>
            </div>

            <div className="view-modal-content">
              <div className="proforma-info-grid">
                <div className="info-block">
                  <label>NÚMERO:</label>
                  <p><strong>{proforma.numeroProforma}</strong></p>
                  <label>FECHA EMISIÓN:</label>
                  <p>{formatLocalDate(proforma.fechaEmision)}</p>
                  <label>VENCIMIENTO:</label>
                  <p>{formatLocalDate(proforma.fechaValidez)}</p>
                </div>
                <div className="info-block">
                  <label>CLIENTE:</label>
                  <p><strong>{clienteDisplay.nombreCompleto}</strong></p>
                  <p><strong>ID/RUC:</strong> {clienteDisplay.identificacion}</p>
                  <p><strong>Email:</strong> {clienteDisplay.email}</p>
                </div>
              </div>

              <div className="details-table-container">
                <table className="view-items-table">
                  <thead>
                    <tr>
                      <th>PRODUCTO / SERVICIO</th>
                      <th className="text-center">CANT.</th>
                      <th className="text-right">P. UNITARIO</th>
                      <th className="text-right">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proforma.detalles?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.producto?.nombre || `Producto #${item.productoServicioId}`}</td>
                        <td className="text-center">{item.cantidad}</td>
                        <td className="text-right">${Number(item.precioUnitario || 0).toFixed(2)}</td>
                        <td className="text-right">${(Number(item.cantidad || 0) * Number(item.precioUnitario || 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="view-summary-grid">
                <div className="observations-box">
                  <label>Observaciones:</label>
                  <p>{proforma.observaciones || "Sin observaciones."}</p>
                </div>
                <div className="totals-box">
                  <div className="total-row"><span>Subtotal:</span><span>${Number(proforma.subtotalSinIva || 0).toFixed(2)}</span></div>
                  <div className="total-row discount"><span>Descuento:</span><span>-${Number(proforma.totalDescuento || 0).toFixed(2)}</span></div>
                  <div className="total-row"><span>IVA:</span><span>${Number(proforma.iva || 0).toFixed(2)}</span></div>
                  <div className="total-final"><span>TOTAL:</span><span>${Number(proforma.totalFinal || 0).toFixed(2)}</span></div>
                </div>
              </div>
            </div>

            <div className="view-modal-footer">
              <button className="btn-print" onClick={() => window.print()}><Printer size={18} /> Imprimir</button>
              <button className="btn-close-bottom" onClick={onClose}>Cerrar</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
