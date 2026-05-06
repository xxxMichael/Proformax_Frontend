import { useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, FileText } from "lucide-react";
import { updateProformaStatus } from "../services/proformaService";
import toast from "react-hot-toast";
import "./statusModal.css";

export default function StatusModal({ isOpen, onClose, onSuccess, proforma }) {
  const [selectedStatus, setSelectedStatus] = useState("ACEPTADA");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !proforma) return null;

  const currentStatus = proforma.estado;

  const possibleStates = currentStatus === "EMITIDA"
    ? [
        { value: "ACEPTADA", label: "Aceptada",  description: "La venta fue cerrada exitosamente", icon: "✅" },
        { value: "ANULADA",  label: "Anulada",   description: "La proforma fue cancelada",          icon: "❌" },
      ]
    : [];

  const handleConfirm = async () => {
    if (!selectedStatus) return;
    setLoading(true);
    try {
      await updateProformaStatus(proforma.id, selectedStatus, observaciones);
      toast.success(`Estado cambiado a ${selectedStatus}`);
      setObservaciones("");
      setSelectedStatus("ACEPTADA");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Error al cambiar estado");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    /* ── Overlay ── */
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(15,23,42,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      {/* ── Card ── */}
      <div style={{
        background: "#ffffff", width: "100%", maxWidth: "480px",
        borderRadius: "20px", overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
        display: "flex", flexDirection: "column",
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "20px 26px",
          background: "linear-gradient(135deg,#1e293b,#334155)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h3 style={{ margin: 0, color: "white", fontSize: "17px", fontWeight: 700 }}>
            Cambiar Estado
          </h3>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.15)", border: "none", color: "white",
            width: "30px", height: "30px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}><X size={16} /></button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px 26px" }}>

          {/* Info pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "12px", padding: "12px 16px", marginBottom: "22px",
          }}>
            <div style={{
              width: "38px", height: "38px", background: "#e0e7ff",
              borderRadius: "10px", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}>
              <FileText size={18} style={{ color: "#6366f1" }} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                {proforma.numeroProforma}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                Estado actual:
                <span className={`badge-status ${currentStatus}`}>{currentStatus}</span>
              </div>
            </div>
          </div>

          {possibleStates.length === 0 ? (
            /* Bloqueado */
            <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
              <div style={{ fontSize: "42px", marginBottom: "12px" }}>🔒</div>
              <h4 style={{ margin: "0 0 8px", fontSize: "16px", color: "#0f172a" }}>
                No se puede cambiar el estado
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b", lineHeight: 1.5 }}>
                Las proformas <strong>{currentStatus.toLowerCase()}</strong> son definitivas y no pueden modificarse.
              </p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", marginBottom: "12px" }}>
                Selecciona el nuevo estado
              </div>

              {/* Opciones */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {possibleStates.map((state) => {
                  const isSelected = selectedStatus === state.value;
                  const isAceptada = state.value === "ACEPTADA";
                  return (
                    <label key={state.value} style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "13px 15px",
                      border: `2px solid ${isSelected ? (isAceptada ? "#16a34a" : "#dc2626") : "#e2e8f0"}`,
                      borderRadius: "12px", cursor: "pointer",
                      background: isSelected ? (isAceptada ? "#f0fdf4" : "#fef2f2") : "white",
                      transition: "all 0.15s",
                    }}>
                      <input type="radio" name="newStatus" value={state.value}
                        checked={isSelected} onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{ display: "none" }} />
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
                        background: isAceptada ? "#dcfce7" : "#fee2e2",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                      }}>{state.icon}</div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>{state.label}</strong>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{state.description}</span>
                      </div>
                      <div style={{
                        width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${isSelected ? (isAceptada ? "#16a34a" : "#dc2626") : "#cbd5e1"}`,
                        background: isSelected ? (isAceptada ? "#16a34a" : "#dc2626") : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: "11px", fontWeight: 700,
                      }}>{isSelected ? "✓" : ""}</div>
                    </label>
                  );
                })}
              </div>

              {/* Observaciones */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b" }}>
                  Observaciones (opcional)
                </label>
                <textarea
                  placeholder="Ej: El cliente aceptó el presupuesto por teléfono..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  style={{
                    padding: "11px 13px", border: "1.5px solid #e2e8f0", borderRadius: "10px",
                    resize: "none", fontSize: "14px", color: "#1e293b",
                    fontFamily: "inherit", outline: "none",
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "16px 26px", background: "#f8fafc",
          display: "flex", justifyContent: "flex-end", gap: "10px",
          borderTop: "1px solid #e2e8f0",
        }}>
          <button onClick={onClose} style={{
            padding: "9px 20px", background: "white", border: "1.5px solid #e2e8f0",
            borderRadius: "9px", color: "#64748b", fontWeight: 600, fontSize: "14px",
            cursor: "pointer",
          }}>Cancelar</button>
          {possibleStates.length > 0 && (
            <button onClick={handleConfirm} disabled={loading} style={{
              padding: "9px 20px",
              background: loading ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#4f46e5)",
              color: "white", border: "none", borderRadius: "9px",
              fontWeight: 700, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "7px",
              boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
            }}>
              <CheckCircle size={16} />
              {loading ? "Guardando..." : "Confirmar Cambio"}
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
