import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Printer } from "lucide-react";
import "./viewProformaModal.css";
import { getProformaById } from "../services/proformaService";
import { getClienteById } from "../services/clientService";
import { getConfig } from "../services/configService";
import toast from "react-hot-toast";

export default function ViewProformaModal({ isOpen, onClose, proformaId }) {
  const [proforma, setProforma] = useState(null);
  const [clienteFull, setClienteFull] = useState(null);
  const [companyConfig, setCompanyConfig] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && proformaId) {
      cargarTodo();
    } else {
      setProforma(null);
      setClienteFull(null);
      setCompanyConfig(null);
      setLogoPreview(null);
    }
  }, [isOpen, proformaId]);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const [respP, respConfig] = await Promise.all([
        getProformaById(proformaId),
        getConfig().catch(() => null)
      ]);
      const pData = respP.data || respP;
      setProforma(pData);
      
      if (respConfig?.data) {
        setCompanyConfig(respConfig.data);
      }

      const savedLogo = localStorage.getItem("empresa_logo");
      if (savedLogo) setLogoPreview(savedLogo);

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

  const parseDate = (dateStr) => {
    if (!dateStr) return { day: "DD", month: "MM", year: "YYYY" };
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return { day, month, year };
  };

  if (!isOpen) return null;

  const clienteDisplay = {
    nombreCompleto: proforma?.cliente ? `${proforma.cliente.nombres} ${proforma.cliente.apellidosRazonSocial}` : "N/A",
    identificacion: clienteFull?.identificacion || proforma?.cliente?.identificacion || "..............................",
    direccion: clienteFull?.direccion || "..........................................................."
  };

  const fechaE = parseDate(proforma?.fechaEmision);

  // Generate empty rows to pad the table if needed (e.g., minimum 10 rows)
  const minRows = 10;
  const items = proforma?.detalles || [];
  const emptyRowsCount = Math.max(0, minRows - items.length);
  const emptyRows = Array.from({ length: emptyRowsCount });

  // Calcular porcentaje de IVA aplicado
  const totalIvaAmount = Number(proforma?.totalIva || proforma?.iva || 0);
  const subtotalNeto = Number(proforma?.subtotalSinIva || 0);
  const subtotalBruto = subtotalNeto + Number(proforma?.totalDescuento || 0);
  
  let appliedIvaPct = 0;
  if (totalIvaAmount > 0 && subtotalNeto > 0) {
    appliedIvaPct = Math.round((totalIvaAmount / subtotalNeto) * 100);
  } else if (totalIvaAmount > 0) {
    appliedIvaPct = companyConfig?.porcentajeIvaVigente || 15;
  }

  return createPortal(
    <div className="view-proforma-overlay">
      <div className="view-proforma-container">
        {loading ? (
          <div className="loader-container">Cargando...</div>
        ) : proforma && (
          <>
            {/* Botones de acción fuera de la zona de impresión */}
            <div className="view-modal-actions no-print">
              <div className="header-status">
                <h2>Detalle de Proforma</h2>
                <span className={`status-badge ${proforma.estado.toLowerCase()}`}>{proforma.estado}</span>
              </div>
              <div className="action-buttons">
                <button className="btn-print" onClick={() => window.print()}><Printer size={18} /> Imprimir</button>
                <button className="btn-close-view" onClick={onClose}><X size={24} /></button>
              </div>
            </div>

            <div className="printable-document">
              
              <div className="doc-header">
                <div className="doc-company-info">
                  <div className="doc-company-title">
                    {companyConfig?.razonSocial || "NOMBRE DE LA EMPRESA"}
                  </div>
                  <div className="doc-company-details">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="doc-logo" />
                    ) : (
                      <div className="doc-logo-placeholder">SIN LOGO</div>
                    )}
                    <div className="doc-address-text">
                      <p>{companyConfig?.direccion || "Dirección de la empresa"}</p>
                      <p>Cel. {companyConfig?.telefono || "0000000000"}</p>
                    </div>
                  </div>
                </div>

                <div className="doc-meta-box">
                  <div className="doc-ruc-line">RUC. N° {companyConfig?.ruc || "0000000000000"}</div>
                  <div className="doc-proforma-title">PROFORMA</div>
                  <div className="doc-proforma-number">
                    <span>001</span>
                    <span className="doc-red-number">N° {proforma.numeroProforma}</span>
                  </div>
                  <div className="doc-date-grid">
                    <div className="date-header">DIA</div>
                    <div className="date-header">MES</div>
                    <div className="date-header">AÑO</div>
                    <div className="date-cell">{fechaE.day}</div>
                    <div className="date-cell">{fechaE.month}</div>
                    <div className="date-cell">{fechaE.year}</div>
                  </div>
                </div>
              </div>

              <div className="doc-client-info">
                <div className="client-line">
                  <span className="client-label">Sr.(es):</span>
                  <span className="client-value bold">{clienteDisplay.nombreCompleto}</span>
                </div>
                <div className="client-line-split">
                  <div className="client-line flex-grow">
                    <span className="client-label">Dirección:</span>
                    <span className="client-value">{clienteDisplay.direccion}</span>
                  </div>
                  <div className="client-line">
                    <span className="client-label">RUC/ID:</span>
                    <span className="client-value">{clienteDisplay.identificacion}</span>
                  </div>
                </div>
                <p className="doc-intro-text">
                  Estimados Señores;<br/>
                  En atención a su solicitud, sírvase encontrar en la presente nuestra propuesta por los bienes y/o servicios requeridos. Quedamos en la espera de su amable respuesta confirmándonos su aceptación:
                </p>
              </div>

              <div className="doc-table-container">
                <table className="doc-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>CANT.</th>
                      <th style={{ width: '55%' }}>DETALLE</th>
                      <th style={{ width: '17%' }}>P. UNIT.</th>
                      <th style={{ width: '18%' }}>IMPORTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center">{item.cantidad}</td>
                        <td>{item.producto?.nombre || `Producto #${item.productoServicioId}`}</td>
                        <td className="text-right">{Number(item.precioUnitario || 0).toFixed(2)}</td>
                        <td className="text-right">{(Number(item.cantidad || 0) * Number(item.precioUnitario || 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                    {emptyRows.map((_, index) => (
                      <tr key={`empty-${index}`} className="empty-row">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="doc-footer">
                <div className="doc-signature-box">
                  {proforma.observaciones && (
                     <div className="doc-obs-box">
                        <strong>Obs:</strong> {proforma.observaciones}
                     </div>
                  )}
                  <div className="doc-signature-area">
                    <div className="doc-signature-line"></div>
                    <div className="doc-signature-text">FIRMA AUTORIZADA</div>
                  </div>
                </div>
                
                <div className="doc-totals-box">
                  <div className="doc-total-row">
                    <span>SUBTOTAL $</span>
                    <div className="doc-total-value">{subtotalBruto.toFixed(2)}</div>
                  </div>
                  <div className="doc-total-row">
                    <span>DESCUENTO {Number(proforma.porcentajeDescuento) > 0 ? `(${proforma.porcentajeDescuento}%) ` : ""} $</span>
                    <div className="doc-total-value">{Number(proforma.totalDescuento || 0).toFixed(2)}</div>
                  </div>
                  <div className="doc-total-row">
                    <span>IVA {totalIvaAmount > 0 ? `(${appliedIvaPct}%) ` : "(0%) "} $</span>
                    <div className="doc-total-value">{totalIvaAmount.toFixed(2)}</div>
                  </div>
                  <div className="doc-total-row doc-total-final">
                    <span>TOTAL $</span>
                    <div className="doc-total-value bold">{Number(proforma.totalFinal || 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
