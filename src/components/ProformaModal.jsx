import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./proformaModal.css";

import { getClientes } from "../services/clientService";
import { getProductos } from "../services/productService";

export default function ProformaModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
}) {
  const emptyDetalle = {
    productoServicioId: "",
    cantidad: 1,
    precioUnitario: "",
  };

  const emptyForm = {
    clienteId: "",
    fechaValidez: "",
    porcentajeDescuento: 0,
    aplicaIva: true,
    observaciones: "",
    detalles: [{ ...emptyDetalle }],
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  
  // Estados para el buscador de clientes (Accesibilidad adultos)
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientFilter, setClientFilter] = useState("");
  const [clientPage, setClientPage] = useState(1);
  const clientsPerPage = 5;

  // Cargar clientes y productos al abrir
  useEffect(() => {
    if (!isOpen) return;

    setErrors({});

    const cargarDatos = async () => {
      try {
        const [respClientes, respProductos] = await Promise.all([
          getClientes(1, 100, ""),
          getProductos(1, 100, ""),
        ]);
        setClientes(respClientes.data);
        setProductos(respProductos.data);
      } catch (error) {
        console.error("Error cargando datos para proforma", error);
      }
    };

    cargarDatos();

    if (mode === "create") {
      // Fecha de validez por defecto: HOY
      const hoy = new Date();
      const fechaDefault = hoy.toISOString().split("T")[0];

      setForm({
        ...emptyForm,
        fechaValidez: fechaDefault,
        detalles: [{ ...emptyDetalle }],
      });
    } else if (initialData) {
      setForm({
        clienteId: initialData.clienteId || "",
        fechaValidez: initialData.fechaValidez ? new Date(initialData.fechaValidez).toISOString().split("T")[0] : "",
        porcentajeDescuento: initialData.porcentajeDescuento ?? 0,
        aplicaIva: initialData.aplicaIva ?? true,
        observaciones: initialData.observaciones || "",
        detalles:
          initialData.detalles && initialData.detalles.length > 0
            ? initialData.detalles.map((d) => ({
                productoServicioId: d.productoServicioId,
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario,
              }))
            : [{ ...emptyDetalle }],
      });
    }
  }, [isOpen, initialData]);

  // ======== MANEJO DE CAMPOS GENERALES ========
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "porcentajeDescuento") {
      const num = parseFloat(value);
      if (value === "" || (num >= 0 && num <= 100)) {
        setForm({ ...form, [name]: value === "" ? "" : num });
      }
      return;
    }

    if (name === "aplicaIva") {
      setForm({ ...form, [name]: e.target.checked });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  // ======== MANEJO DE DETALLES ========
  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...form.detalles];

    if (field === "productoServicioId") {
      nuevosDetalles[index].productoServicioId = value ? parseInt(value) : "";

      // Auto-llenar precio del producto seleccionado
      const producto = productos.find((p) => p.id === parseInt(value));
      if (producto) {
        nuevosDetalles[index].precioUnitario = producto.precioBase;
      }
    } else if (field === "cantidad") {
      nuevosDetalles[index].cantidad = value === "" ? "" : parseInt(value) || 0;
    } else if (field === "precioUnitario") {
      nuevosDetalles[index].precioUnitario =
        value === "" ? "" : parseFloat(value) || 0;
    }

    setForm({ ...form, detalles: nuevosDetalles });
  };

  const agregarDetalle = () => {
    setForm({
      ...form,
      detalles: [...form.detalles, { ...emptyDetalle }],
    });
  };

  const eliminarDetalle = (index) => {
    if (form.detalles.length <= 1) return;
    
    const detalle = form.detalles[index];
    if (detalle.productoServicioId || detalle.cantidad > 1) {
      if (!window.confirm("¿Estás seguro de eliminar esta línea de producto?")) {
        return;
      }
    }

    const nuevos = form.detalles.filter((_, i) => i !== index);
    setForm({ ...form, detalles: nuevos });
  };

  // ======== CÁLCULOS ========
  const subtotalSinIva = form.detalles.reduce((sum, d) => {
    const cant = parseFloat(d.cantidad) || 0;
    const precio = parseFloat(d.precioUnitario) || 0;
    return sum + (cant * precio);
  }, 0);

  const descuentoPercent = parseFloat(form.porcentajeDescuento) || 0;
  const totalDescuento = Math.round(subtotalSinIva * (descuentoPercent / 100) * 100) / 100;
  
  // Base para el IVA (solo de productos que aplican IVA)
  const baseGravable = form.detalles.reduce((sum, d) => {
    const producto = productos.find(p => Number(p.id) === Number(d.productoServicioId));
    if (producto?.aplicaIva) {
      const cant = parseFloat(d.cantidad) || 0;
      const precio = parseFloat(d.precioUnitario) || 0;
      return sum + (cant * precio);
    }
    return sum;
  }, 0);

  // Aplicar descuento proporcional a la base gravable
  const factorDescuento = 1 - (descuentoPercent / 100);
  const baseConDescuento = baseGravable * factorDescuento;

  // IVA Final (solo si el checkbox global está marcado)
  const totalIva = form.aplicaIva 
    ? Math.round(baseConDescuento * 0.15 * 100) / 100 
    : 0;

  const totalFinal = Math.round((subtotalSinIva - totalDescuento + totalIva) * 100) / 100;

  // ======== VALIDACIÓN ========
  const validarFormulario = () => {
    let newErrors = {};

    if (!form.clienteId) {
      newErrors.clienteId = "Seleccione un cliente";
    }

    if (!form.fechaValidez) {
      newErrors.fechaValidez = "Ingrese fecha de validez";
    }

    // Validar detalles
    let detallesValidos = true;
    form.detalles.forEach((d, i) => {
      if (!d.productoServicioId) {
        newErrors[`detalle_producto_${i}`] = "Seleccione producto";
        detallesValidos = false;
      }
      if (!d.cantidad || d.cantidad <= 0) {
        newErrors[`detalle_cantidad_${i}`] = "Cantidad inválida";
        detallesValidos = false;
      }
      if (!d.precioUnitario || d.precioUnitario <= 0) {
        newErrors[`detalle_precio_${i}`] = "Precio inválido";
        detallesValidos = false;
      }
    });

    if (!detallesValidos) {
      newErrors.detalles = "Revise los detalles de la proforma";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ======== GUARDAR ========
  const handleSave = () => {
    if (!validarFormulario()) return;

    const payload = {
      clienteId: parseInt(form.clienteId),
      fechaValidez: form.fechaValidez,
      porcentajeDescuento: parseFloat(form.porcentajeDescuento) || 0,
      aplicaIva: form.aplicaIva,
      observaciones: form.observaciones,
      detalles: form.detalles.map((d) => ({
        productoServicioId: parseInt(d.productoServicioId),
        cantidad: parseInt(d.cantidad),
        precioUnitario: parseFloat(d.precioUnitario),
      })),
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="proforma-modal-overlay">
      <div className="proforma-modal-container">
        <h2 className="modal-title">
          {mode === "create" ? "Nueva Proforma" : "Editar Proforma"}
        </h2>
        <p className="modal-subtext">
          {mode === "create"
            ? "Complete los datos para generar una nueva proforma"
            : "Modifique los datos de la proforma (solo en estado EMITIDA)"}
        </p>

        {/* ========== SECCIÓN: DATOS GENERALES ========== */}
        <div className="form-section">
          <h3>📋 Datos Generales</h3>
          <div className="form-grid">
            {/* Cliente (Selector Profesional) */}
            <div className="full-width">
              <label>Cliente:</label>
              <div className="client-search-input-group">
                <input
                  type="text"
                  readOnly
                  placeholder="Haga clic en el botón para buscar un cliente..."
                  value={
                    clientes.find((c) => c.id === parseInt(form.clienteId))
                      ? `${clientes.find((c) => c.id === parseInt(form.clienteId)).identificacion} - ${clientes.find((c) => c.id === parseInt(form.clienteId)).nombres} ${clientes.find((c) => c.id === parseInt(form.clienteId)).apellidosRazonSocial}`
                      : ""
                  }
                  className="client-readonly-input"
                />
                {mode === "create" && (
                  <button 
                    type="button" 
                    className="btn-search-trigger"
                    onClick={() => {
                      setClientPage(1);
                      setShowClientSearch(true);
                    }}
                  >
                    🔍 Buscar
                  </button>
                )}
              </div>
              {errors.clienteId && (
                <span className="error">{errors.clienteId}</span>
              )}
            </div>

            {/* Fecha de Validez */}
            <div>
              <label>Fecha de Validez:</label>
              <input
                type="date"
                name="fechaValidez"
                value={form.fechaValidez}
                onChange={handleChange}
              />
              {errors.fechaValidez && (
                <span className="error">{errors.fechaValidez}</span>
              )}
            </div>

            {/* Descuento */}
            <div>
              <label>Descuento (%):</label>
              <input
                type="number"
                name="porcentajeDescuento"
                value={form.porcentajeDescuento}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            {/* Checkbox IVA */}
            <div className="checkbox-container">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="aplicaIva"
                  checked={form.aplicaIva}
                  onChange={handleChange}
                />
                <span>Aplicar IVA (15%)</span>
              </label>
            </div>

            {/* Observaciones */}
            <div className="full-width">
              <label>Observaciones:</label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                placeholder="Notas adicionales..."
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* ========== SECCIÓN: DETALLE DE PRODUCTOS ========== */}
        <div className="detalles-section">
          <h3>📦 Detalle de Productos / Servicios</h3>

          {errors.detalles && (
            <span className="error" style={{ marginBottom: 8, display: "block" }}>
              {errors.detalles}
            </span>
          )}

          <table className="detalles-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto / Servicio</th>
                <th>Cantidad</th>
                <th>P. Unitario</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {form.detalles.map((detalle, index) => {
                const subtotalLinea =
                  (parseFloat(detalle.cantidad) || 0) *
                  (parseFloat(detalle.precioUnitario) || 0);

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <select
                        value={detalle.productoServicioId}
                        onChange={(e) =>
                          handleDetalleChange(
                            index,
                            "productoServicioId",
                            e.target.value
                          )
                        }
                      >
                        <option value="">-- Seleccionar --</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.codigo} — {p.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={detalle.cantidad}
                        onChange={(e) =>
                          handleDetalleChange(index, "cantidad", e.target.value)
                        }
                        min="1"
                        style={{ width: 70 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={detalle.precioUnitario}
                        onChange={(e) =>
                          handleDetalleChange(
                            index,
                            "precioUnitario",
                            e.target.value
                          )
                        }
                        min="0"
                        step="0.01"
                        style={{ width: 100 }}
                      />
                    </td>
                    <td className="subtotal-col">
                      ${subtotalLinea.toFixed(2)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-remove-row"
                        onClick={() => eliminarDetalle(index)}
                        disabled={form.detalles.length <= 1}
                        title="Eliminar línea"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button type="button" className="btn-add-row" onClick={agregarDetalle}>
            + Agregar línea
          </button>
        </div>

        {/* ========== RESUMEN DE TOTALES ========== */}
        <div className="totales-resumen">
          <div className="totales-box">
            <div className="total-row">
              <span>Subtotal sin IVA:</span>
              <span>${subtotalSinIva.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Descuento ({descuentoPercent}%):</span>
              <span>-${totalDescuento.toFixed(2)}</span>
            </div>
            <div className={`total-row ${!form.aplicaIva ? 'no-iva' : ''}`}>
              <span>IVA (15%):</span>
              <span>${totalIva.toFixed(2)}</span>
            </div>
            <div className="total-row final">
              <span>TOTAL:</span>
              <span>${totalFinal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ========== BOTONES ========== */}
        <div className="modal-buttons">
          <button onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
          {mode === "create" && (
            <button
              onClick={() => setForm(emptyForm)}
              className="btn-clear"
              type="button"
            >
              Limpiar
            </button>
          )}
          <button onClick={handleSave} className="btn-save">
            {mode === "create" ? "Crear Proforma" : "Guardar Cambios"}
          </button>
        </div>
        {/* ========== SUB-MODAL: BUSCADOR DE CLIENTES ========== */}
        {showClientSearch && (
          <div className="client-search-overlay">
            <div className="client-search-card">
              <div className="search-header-standard">
                <h3>Seleccionar Cliente</h3>
                <button 
                  className="btn-close-modal"
                  onClick={() => setShowClientSearch(false)}
                >✕</button>
              </div>

              <div className="search-input-box">
                <input
                  type="text"
                  placeholder="Buscar por nombre o identificación..."
                  className="search-control"
                  autoFocus
                  value={clientFilter}
                  onChange={(e) => {
                    setClientFilter(e.target.value);
                    setClientPage(1);
                  }}
                />
              </div>

              <div className="search-results-container">
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Identificación</th>
                      <th>Nombre / Razón Social</th>
                      <th className="text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes
                      .filter(c => 
                        c.identificacion.includes(clientFilter) ||
                        `${c.nombres} ${c.apellidosRazonSocial}`.toLowerCase().includes(clientFilter.toLowerCase())
                      )
                      .slice((clientPage - 1) * clientsPerPage, clientPage * clientsPerPage)
                      .map(c => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.identificacion}</td>
                          <td>{c.nombres} {c.apellidosRazonSocial}</td>
                          <td className="text-right">
                            <button
                              type="button"
                              className="btn-select-client"
                              onClick={() => {
                                setForm({...form, clienteId: c.id.toString()});
                                setShowClientSearch(false);
                                setClientFilter("");
                              }}
                            >
                              Seleccionar
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="search-pagination">
                <button 
                  className="btn-page"
                  disabled={clientPage === 1}
                  onClick={() => setClientPage(prev => prev - 1)}
                >
                  Anterior
                </button>
                <span className="page-info">Página {clientPage}</span>
                <button 
                  className="btn-page"
                  disabled={clientPage * clientsPerPage >= clientes.filter(c => c.identificacion.includes(clientFilter) || `${c.nombres} ${c.apellidosRazonSocial}`.toLowerCase().includes(clientFilter.toLowerCase())).length}
                  onClick={() => setClientPage(prev => prev + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
