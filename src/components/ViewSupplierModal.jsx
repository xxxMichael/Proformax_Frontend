import "./ViewModal.css";

export default function ViewSupplierModal({ isOpen, onClose, proveedor }) {
  if (!isOpen) return null;

  return (
    <div className="view-modal-overlay">
      <div className="view-modal">
        <h2>Detalle del Proveedor</h2>

        {!proveedor ? (
          <p style={{ textAlign: "center" }}>No hay información para mostrar.</p>
        ) : (
          <div className="view-card">
            <p><strong>Identificación:</strong> {proveedor.identificacion}</p>
            <p><strong>Razón Social:</strong> {proveedor.razonSocial}</p>
            <p><strong>Nombre Comercial:</strong> {proveedor.nombreComercial || "—"}</p>
            <p><strong>Teléfono:</strong> {proveedor.telefono}</p>
            <p><strong>Email:</strong> {proveedor.email}</p>
            <p><strong>Dirección:</strong> {proveedor.direccion || "Sin dirección"}</p>
            <p><strong>Estado:</strong> {proveedor.estado ? "Activo" : "Inactivo"}</p>
          </div>
        )}

        <button className="close-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
