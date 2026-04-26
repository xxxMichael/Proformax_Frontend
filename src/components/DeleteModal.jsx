import "./DeleteModal.css";

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Eliminar registro",
  message = "¿Estás seguro de eliminar este registro?",
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">

        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>

        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>

          <button className="btn-delete" onClick={onConfirm}>
            Eliminar
          </button>
        </div>

      </div>
    </div>
  );
}