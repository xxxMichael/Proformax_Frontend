import { AlertCircle } from "lucide-react";
import "./DeleteModal.css";

export default function ErrorModal({ isOpen, onClose, title = "Error", message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ textAlign: "center", maxWidth: "400px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", color: "#ef4444" }}>
          <AlertCircle size={48} />
        </div>
        <h2 className="modal-title" style={{ marginBottom: "10px", color: "#1e293b" }}>{title}</h2>
        <p className="modal-message" style={{ marginBottom: "24px", color: "#475569" }}>{message}</p>

        <div className="modal-buttons" style={{ justifyContent: "center" }}>
          <button className="btn-cancel" onClick={onClose} style={{ width: "100%", padding: "10px" }}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
