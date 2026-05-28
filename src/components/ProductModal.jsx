import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./productModal.css";
import { validarDuplicadoProducto } from "../services/productService";
import { getConfig } from "../services/configService";

// 🔹 Tipos disponibles
const TIPOS_PRODUCTO = [
  { value: "producto", label: "Producto" },
  { value: "servicio", label: "Servicio" },
  { value: "material", label: "Material" },
  { value: "acabado", label: "Acabado" },
  { value: "accesorio", label: "Accesorio" },
];

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
  productoId = null,
}) {
  const emptyForm = {
    codigo: "",
    nombre: "",
    descripcion: "",
    tipo: "producto",
    precioBase: "",
    stockActual: "",
    aplicaIva: true,
    estado: true,
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [porcentajeIva, setPorcentajeIva] = useState(15);

  useEffect(() => {
    if (!isOpen) return;

    const fetchConfig = async () => {
      try {
        const res = await getConfig();
        if (res?.data?.porcentajeIvaVigente) {
          setPorcentajeIva(res.data.porcentajeIvaVigente);
        }
      } catch (e) {
        console.error("Error cargando configuración", e);
      }
    };
    fetchConfig();

    // Limpiar errores al abrir el modal
    setErrors({});

    if (mode === "create") {
      setForm({ ...emptyForm });
    } else if (initialData) {
      setForm({
        codigo: initialData.codigo || "",
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        tipo: initialData.tipo || "producto",
        precioBase: initialData.precioBase ?? "",
        stockActual: initialData.stockActual ?? "",
        aplicaIva: initialData.aplicaIva ?? true,
        estado: initialData.estado ?? true,
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
      return;
    }

    // Solo números para stock
    if (name === "stockActual") {
      setForm({ ...form, [name]: value.replace(/\D/g, "") });
      return;
    }

    // Solo números y punto decimal para precio
    if (name === "precioBase") {
      const sanitized = value.replace(/[^0-9.]/g, "");
      // Evitar múltiples puntos
      const parts = sanitized.split(".");
      const clean = parts.length > 2
        ? parts[0] + "." + parts.slice(1).join("")
        : sanitized;
      setForm({ ...form, [name]: clean });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const validarFormulario = () => {
    let newErrors = {};

    // 🔹 CÓDIGO
    if (!form.codigo.trim()) {
      newErrors.codigo = "Ingrese el código del producto";
    }

    // 🔹 NOMBRE
    if (!form.nombre.trim()) {
      newErrors.nombre = "Ingrese el nombre del producto";
    }

    // 🔹 TIPO
    if (!form.tipo) {
      newErrors.tipo = "Seleccione un tipo";
    }

    // 🔹 PRECIO
    const precio = parseFloat(form.precioBase);
    if (isNaN(precio) || precio < 0) {
      newErrors.precioBase = "Ingrese un precio válido";
    }

    // 🔹 STOCK (solo si es producto/material/acabado/accesorio)
    if (form.tipo !== "servicio") {
      const stock = parseInt(form.stockActual);
      if (isNaN(stock) || stock < 0) {
        newErrors.stockActual = "Ingrese un stock válido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validarFormulario()) return;

    try {
      const duplicados = await validarDuplicadoProducto(form.codigo);

      // En modo editar, excluir el producto actual
      const otros =
        mode === "edit" && productoId
          ? duplicados.filter((p) => p.id !== productoId)
          : duplicados;

      // Verificar código duplicado
      const mismoCodigo = otros.find((p) => p.codigo === form.codigo);
      if (mismoCodigo) {
        setErrors({ codigo: "Este código ya está registrado" });
        return;
      }

      // ✅ SI TODO OK
      onSave(form);
    } catch (error) {
      console.error("Error validando duplicados", error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="product-modal-overlay">
      <div className="product-modal-container">
        <h2 className="modal-title">
          {mode === "create" ? "Nuevo Producto" : "Editar Producto"}
        </h2>

        <p className="modal-subtext">
          Registro de producto, servicio o material
        </p>

        <div className="form-grid">
          {/* Código */}
          <div>
            <label>Código:</label>
            <input
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              placeholder="Ej: PROD-001"
              disabled={mode === "edit"}
            />
            {errors.codigo && (
              <span className="error">{errors.codigo}</span>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label>Nombre:</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre del producto"
            />
            {errors.nombre && (
              <span className="error">{errors.nombre}</span>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label>Tipo:</label>
            <select name="tipo" value={form.tipo} onChange={handleChange}>
              {TIPOS_PRODUCTO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.tipo && (
              <span className="error">{errors.tipo}</span>
            )}
          </div>

          {/* Precio Base */}
          <div>
            <label>Precio Base ($):</label>
            <input
              name="precioBase"
              value={form.precioBase}
              onChange={handleChange}
              placeholder="0.00"
            />
            {errors.precioBase && (
              <span className="error">{errors.precioBase}</span>
            )}
          </div>

          {/* Stock */}
          <div>
            <label>Stock Actual:</label>
            <input
              name="stockActual"
              value={form.stockActual}
              onChange={handleChange}
              placeholder="0"
              disabled={form.tipo === "servicio"}
            />
            {errors.stockActual && (
              <span className="error">{errors.stockActual}</span>
            )}
          </div>

          {/* IVA */}
          <div>
            <label>Impuesto:</label>
            <div className="checkbox-row">
              <input
                type="checkbox"
                name="aplicaIva"
                id="aplicaIva"
                checked={form.aplicaIva}
                onChange={handleChange}
              />
              <label htmlFor="aplicaIva">Aplica IVA ({porcentajeIva}%)</label>
            </div>
          </div>

          {/* Estado */}
          {mode === "edit" && (
            <div>
              <label>Estado del Producto:</label>
              <div className="checkbox-row" style={{ marginTop: '8px' }}>
                <input
                  type="checkbox"
                  name="estado"
                  id="estadoProducto"
                  checked={form.estado}
                  onChange={handleChange}
                />
                <label htmlFor="estadoProducto" style={{ color: form.estado ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                  {form.estado ? "ACTIVO" : "INACTIVO"}
                </label>
              </div>
            </div>
          )}

          {/* Descripción — fila completa */}
          <div className="full-width">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción del producto o servicio"
              rows={3}
            />
          </div>
        </div>

        <div className="modal-buttons">
          <button onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn-save">
            {mode === "create" ? "Guardar Producto" : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
