import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X, Upload, FileText, Search, Check, AlertTriangle,
  ChevronLeft, Package, Truck, ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

import { analizarFactura, confirmarFactura } from "../services/facturaService";
import { getProductos } from "../services/productService";
import "./facturaModal.css";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/tiff",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function FacturaModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Datos extraídos del paso 1
  const [datosExtraidos, setDatosExtraidos] = useState(null);
  const [candidatos, setCandidatos] = useState([]);
  const [avisos, setAvisos] = useState([]);

  // Formulario del paso 2
  const [proveedorId, setProveedorId] = useState(null);
  const [numeroFactura, setNumeroFactura] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [items, setItems] = useState([]);
  const [productos, setProductos] = useState([]);

  const fileInputRef = useRef(null);

  // Reset al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFile(null);
      setDragOver(false);
      setAnalyzing(false);
      setConfirming(false);
      setDatosExtraidos(null);
      setCandidatos([]);
      setAvisos([]);
      setProveedorId(null);
      setNumeroFactura("");
      setFechaEmision("");
      setItems([]);
    }
  }, [isOpen]);

  // Cargar productos cuando avanza al paso 2
  useEffect(() => {
    if (step === 2) {
      const cargarProductos = async () => {
        try {
          const resp = await getProductos(1, 200, "");
          setProductos(resp.data || []);
        } catch (e) {
          console.error(e);
        }
      };
      cargarProductos();
    }
  }, [step]);

  /* ============================================================
     DRAG & DROP + FILE INPUT
     ============================================================ */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const handleFileInput = (e) => {
    const selected = e.target.files[0];
    if (selected) validateAndSetFile(selected);
  };

  const validateAndSetFile = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return toast.error("Tipo de archivo no soportado. Use PDF, JPEG, PNG o TIFF.");
    }
    if (f.size > MAX_FILE_SIZE) {
      return toast.error("El archivo excede 10 MB.");
    }
    setFile(f);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  /* ============================================================
     PASO 1 → Analizar
     ============================================================ */
  const handleAnalizar = async () => {
    if (!file) return toast.error("Seleccione un archivo primero.");
    setAnalyzing(true);
    try {
      const resp = await analizarFactura(file);
      setDatosExtraidos(resp.datosExtraidos);
      setCandidatos(resp.candidatosProveedor || []);
      setAvisos(resp.avisos || []);

      // Pre-llenar formulario
      setNumeroFactura(resp.datosExtraidos?.numeroFactura || "");
      setFechaEmision(
        resp.datosExtraidos?.fechaEmision
          ? new Date(resp.datosExtraidos.fechaEmision).toISOString().split("T")[0]
          : ""
      );
      setItems(
        (resp.datosExtraidos?.items || []).map((item, idx) => ({
          ...item,
          _key: idx,
          productoId: null,
        }))
      );

      // Auto-seleccionar proveedor con score 100
      const bestMatch = (resp.candidatosProveedor || []).find(
        (c) => c._score === 100
      );
      if (bestMatch) setProveedorId(bestMatch.id);

      setStep(2);
      toast.success("Factura analizada correctamente");
    } catch (e) {
      toast.error(e.message || "Error al analizar la factura");
    } finally {
      setAnalyzing(false);
    }
  };

  /* ============================================================
     PASO 2 → Confirmar
     ============================================================ */
  const handleConfirmar = async () => {
    if (!proveedorId) return toast.error("Debe seleccionar un proveedor.");
    if (!numeroFactura.trim()) return toast.error("El número de factura es obligatorio.");
    if (!fechaEmision) return toast.error("La fecha de emisión es obligatoria.");
    if (!items.length) return toast.error("La factura debe tener al menos un ítem.");

    setConfirming(true);
    try {
      const payload = {
        proveedorId,
        numeroFactura: numeroFactura.trim(),
        fechaEmision,
        total: datosExtraidos?.total || items.reduce((s, it) => s + (Number(it.totalItem) || 0), 0),
        items: items.map((it) => ({
          descripcion: it.descripcion || "",
          cantidad: Number(it.cantidad) || 0,
          codigoProducto: it.codigoProducto || "",
          precioUnitario: Number(it.precioUnitario) || 0,
          totalItem: Number(it.totalItem) || 0,
          ...(it.productoId ? { productoId: it.productoId } : {}),
        })),
      };

      await confirmarFactura(payload);
      toast.success("Factura confirmada y guardada exitosamente");
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e.message || "Error al confirmar la factura");
    } finally {
      setConfirming(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "high";
    if (score >= 50) return "medium";
    return "low";
  };

  const getScoreLabel = (score) => {
    if (score === 100) return "RUC exacto";
    if (score >= 70) return "Coincidencia parcial";
    return "Bajo";
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="factura-modal-overlay">
      <div className="factura-modal-premium">
        {/* ===== HEADER ===== */}
        <div className="factura-modal-header">
          <div className="factura-title-group">
            <FileText className="factura-icon-main" />
            <div>
              <h2>Nueva Factura de Compra</h2>
              <span>Analice y registre facturas con inteligencia artificial</span>
            </div>
          </div>
          <button className="btn-close-minimal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ===== STEP INDICATOR ===== */}
        <div className="step-indicator">
          <div className={`step-item ${step === 1 ? "active" : "completed"}`}>
            <span className="step-number">{step > 1 ? <Check size={12} /> : "1"}</span>
            Subir Documento
          </div>
          <div className={`step-connector ${step > 1 ? "active" : ""}`} />
          <div className={`step-item ${step === 2 ? "active" : ""}`}>
            <span className="step-number">2</span>
            Revisar y Confirmar
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="factura-modal-body">
          {step === 1 && (
            <>
              {/* ZONA DE UPLOAD */}
              <div
                className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
                  onChange={handleFileInput}
                  style={{ display: "none" }}
                />
                <div className="upload-icon-container">
                  <Upload size={30} />
                </div>
                <h3>
                  {dragOver
                    ? "Suelte el archivo aquí"
                    : "Arrastre su factura o haga clic para seleccionar"}
                </h3>
                <p>Azure AI Document Intelligence extraerá los datos automáticamente</p>
                <div className="upload-formats">
                  <span className="format-badge">PDF</span>
                  <span className="format-badge">JPEG</span>
                  <span className="format-badge">PNG</span>
                  <span className="format-badge">TIFF</span>
                  <span className="format-badge">Máx 10 MB</span>
                </div>
              </div>

              {/* ARCHIVO SELECCIONADO */}
              {file && (
                <div className="file-selected-card">
                  <div className="file-icon">
                    <FileText size={20} />
                  </div>
                  <div className="file-info">
                    <strong>{file.name}</strong>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    className="btn-remove-file"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* BOTÓN ANALIZAR */}
              <button
                className="btn-analizar"
                onClick={handleAnalizar}
                disabled={!file || analyzing}
              >
                {analyzing ? (
                  <>
                    <div className="spinner-inline" />
                    Analizando con Azure AI...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Analizar Factura
                  </>
                )}
              </button>
            </>
          )}

          {step === 2 && datosExtraidos && (
            <div className="review-layout">
              {/* ===== COLUMNA IZQUIERDA ===== */}
              <div className="review-left">
                {/* Datos de la factura */}
                <div className="factura-section">
                  <div className="factura-section-title">
                    <FileText size={14} /> Datos de la Factura
                  </div>
                  <div className="factura-data-grid">
                    <div className="factura-field">
                      <label>Nº Factura</label>
                      <input
                        type="text"
                        value={numeroFactura}
                        onChange={(e) => setNumeroFactura(e.target.value)}
                      />
                    </div>
                    <div className="factura-field">
                      <label>Fecha Emisión</label>
                      <input
                        type="date"
                        value={fechaEmision}
                        onChange={(e) => setFechaEmision(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Proveedor */}
                <div className="factura-section">
                  <div className="factura-section-title">
                    <Truck size={14} /> Seleccionar Proveedor
                  </div>
                  {datosExtraidos.vendorName && (
                    <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
                      Proveedor detectado: <strong>{datosExtraidos.vendorName}</strong>
                      {datosExtraidos.vendorRuc && ` (RUC: ${datosExtraidos.vendorRuc})`}
                    </p>
                  )}
                  <div className="candidatos-list">
                    {candidatos.length > 0 ? (
                      candidatos.map((c) => (
                        <div
                          key={c.id}
                          className={`candidato-card ${proveedorId === c.id ? "selected" : ""}`}
                          onClick={() => setProveedorId(c.id)}
                        >
                          <div className="candidato-avatar">
                            {c.razonSocial?.charAt(0) || "P"}
                          </div>
                          <div className="candidato-info">
                            <strong>{c.razonSocial}</strong>
                            <span>{c.identificacion}</span>
                          </div>
                          <span className={`score-badge ${getScoreClass(c._score)}`}>
                            {getScoreLabel(c._score)} ({c._score})
                          </span>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: 16 }}>
                        No se encontraron proveedores coincidentes. Registre el proveedor primero.
                      </p>
                    )}
                  </div>
                </div>

                {/* Ítems */}
                <div className="factura-section">
                  <div className="factura-section-title">
                    <Package size={14} /> Ítems Detectados ({items.length})
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="items-review-table">
                      <thead>
                        <tr>
                          <th>Descripción</th>
                          <th>Cant</th>
                          <th>P. Unit</th>
                          <th>Total</th>
                          <th>Vincular Producto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={item._key ?? idx}>
                            <td style={{ maxWidth: 200 }}>
                              {item.descripcion || "—"}
                              {item.codigoProducto && (
                                <div style={{ fontSize: 10, color: "#94a3b8" }}>
                                  Cód: {item.codigoProducto}
                                </div>
                              )}
                            </td>
                            <td>{item.cantidad}</td>
                            <td>${Number(item.precioUnitario || 0).toFixed(2)}</td>
                            <td>
                              <strong>${Number(item.totalItem || 0).toFixed(2)}</strong>
                            </td>
                            <td>
                              <select
                                className="item-product-select"
                                value={item.productoId || ""}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[idx].productoId = e.target.value
                                    ? parseInt(e.target.value)
                                    : null;
                                  setItems(newItems);
                                }}
                              >
                                <option value="">— Sin vincular —</option>
                                {productos
                                  .filter((p) => p.estado !== false)
                                  .map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.nombre} ({p.codigo})
                                    </option>
                                  ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ===== COLUMNA DERECHA ===== */}
              <div className="review-right">
                {/* Resumen de totales */}
                <div className="factura-summary-card">
                  <h3>Resumen de Totales</h3>
                  <div className="summary-line">
                    <span>Subtotal:</span>
                    <span>${Number(datosExtraidos.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-line">
                    <span>IVA:</span>
                    <span>${Number(datosExtraidos.totalTax || 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-line total">
                    <span>Total:</span>
                    <span>${Number(datosExtraidos.total || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Confianza de IA */}
                {datosExtraidos.rawConfidence != null && (
                  <div className="factura-section">
                    <div className="factura-section-title">
                      <Search size={14} /> Confianza del Análisis
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 0",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 8,
                          background: "#e2e8f0",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(datosExtraidos.rawConfidence * 100, 100)}%`,
                            height: "100%",
                            background:
                              datosExtraidos.rawConfidence >= 0.8
                                ? "#10b981"
                                : datosExtraidos.rawConfidence >= 0.5
                                ? "#f59e0b"
                                : "#ef4444",
                            borderRadius: 4,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: "#1e293b",
                        }}
                      >
                        {(datosExtraidos.rawConfidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Avisos */}
                {avisos.length > 0 && (
                  <div className="avisos-panel">
                    <h4>
                      <AlertTriangle size={14} /> Avisos ({avisos.length})
                    </h4>
                    {avisos.map((aviso, i) => (
                      <div key={i} className="aviso-item">
                        <AlertTriangle size={12} />
                        {aviso}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="factura-modal-footer">
          <div className="footer-left">
            {step === 2 && (
              <button
                className="btn-back-step"
                onClick={() => setStep(1)}
              >
                <ChevronLeft size={16} /> Volver
              </button>
            )}
          </div>
          <div className="footer-right">
            <button className="btn-cancel-factura" onClick={onClose}>
              Cancelar
            </button>
            {step === 2 && (
              <button
                className="btn-confirmar-factura"
                onClick={handleConfirmar}
                disabled={confirming || !proveedorId}
              >
                {confirming ? (
                  <>
                    <div className="spinner-inline" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Confirmar y Guardar
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
