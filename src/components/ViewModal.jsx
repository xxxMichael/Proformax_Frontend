import "./ViewModal.css";

export default function ViewModal({ isOpen, onClose, cliente }) {
  if (!isOpen) return null;

  return (
    <div className="view-modal-overlay">
      <div className="view-modal">
        <h2>Detalle del Cliente</h2>

        {!cliente ? (
          <p style={{ textAlign: "center" }}>No hay información para mostrar.</p>
        ) : (
          <div className="view-card">

            <p><strong>Identificación:</strong> {cliente.identificacion}</p>
            <p><strong>Nombres:</strong> {cliente.nombres}</p>
            <p><strong>Apellidos:</strong> {cliente.apellidosRazonSocial}</p>
            <p><strong>Teléfono:</strong> {cliente.telefono}</p>
            <p><strong>Email:</strong> {cliente.email}</p>
            <p><strong>Dirección:</strong> {cliente.direccion || "Sin dirección"}</p>

          </div>
        )}

        <button className="close-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}