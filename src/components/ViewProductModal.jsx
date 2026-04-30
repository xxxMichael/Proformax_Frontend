import "./ViewModal.css";

// Mapa de tipos legible
const TIPO_LABELS = {
  producto: "Producto",
  servicio: "Servicio",
  material: "Material",
  acabado: "Acabado",
  accesorio: "Accesorio",
};

export default function ViewProductModal({ isOpen, onClose, producto }) {
  if (!isOpen) return null;

  return (
    <div className="view-modal-overlay">
      <div className="view-modal">
        <h2>Detalle del Producto</h2>

        {!producto ? (
          <p style={{ textAlign: "center" }}>No hay información para mostrar.</p>
        ) : (
          <div className="view-card">
            <p><strong>Código:</strong> {producto.codigo}</p>
            <p><strong>Nombre:</strong> {producto.nombre}</p>
            <p><strong>Tipo:</strong> {TIPO_LABELS[producto.tipo] || producto.tipo}</p>
            <p><strong>Precio Base:</strong> ${parseFloat(producto.precioBase).toFixed(2)}</p>
            <p><strong>Stock Actual:</strong> {producto.tipo === "servicio" ? "N/A" : producto.stockActual}</p>
            <p><strong>Aplica IVA:</strong> {producto.aplicaIva ? "Sí" : "No"}</p>
            <p><strong>Descripción:</strong> {producto.descripcion || "Sin descripción"}</p>
            <p><strong>Estado:</strong> {producto.estado ? "Activo" : "Inactivo"}</p>
          </div>
        )}

        <button className="close-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
