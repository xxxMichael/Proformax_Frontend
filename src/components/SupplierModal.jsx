import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./supplierModal.css";
import { validarDuplicadoProveedor } from "../services/supplierService";

// 🔹 VALIDADORES
const validarRuc = (ruc) => {
  if (!/^\d{13}$/.test(ruc)) return false;

  const provincia = parseInt(ruc.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;

  const tercerDigito = parseInt(ruc[2]);
  if (tercerDigito >= 6) return false;

  let total = 0;
  for (let i = 0; i < 9; i++) {
    let num = parseInt(ruc[i]);
    if (i % 2 === 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    total += num;
  }

  let verificador = 10 - (total % 10);
  if (verificador === 10) verificador = 0;

  if (verificador !== parseInt(ruc[9])) return false;

  return ruc.substring(10) === "001";
};

const validarCedula = (cedula) => {
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2));
  if (provincia < 1 || provincia > 24) return false;

  const tercerDigito = parseInt(cedula[2]);
  if (tercerDigito >= 6) return false;

  let total = 0;
  for (let i = 0; i < 9; i++) {
    let num = parseInt(cedula[i]);
    if (i % 2 === 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    total += num;
  }

  let verificador = 10 - (total % 10);
  if (verificador === 10) verificador = 0;

  return verificador === parseInt(cedula[9]);
};

const validarEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validarTelefono = (tel) => {
  return /^[0-9]{7,10}$/.test(tel);
};

export default function SupplierModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
  proveedorId = null,
}) {
  const emptyForm = {
    idType: "RUC",
    identificacion: "",
    razonSocial: "",
    nombreComercial: "",
    direccion: "",
    telefono: "",
    email: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    // Limpiar errores al abrir el modal
    setErrors({});

    if (mode === "create") {
      setForm({ ...emptyForm });
    } else if (initialData) {
      setForm({
        idType: initialData.idType || "RUC",
        identificacion: initialData.identificacion || "",
        razonSocial: initialData.razonSocial || "",
        nombreComercial: initialData.nombreComercial || "",
        direccion: initialData.direccion || "",
        telefono: initialData.telefono || "",
        email: initialData.email || "",
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    let value = e.target.value;

    // 🔹 Solo números para teléfono e identificación
    if (e.target.name === "telefono" || e.target.name === "identificacion") {
      value = value.replace(/\D/g, "");
    }

    setForm({ ...form, [e.target.name]: value });
  };

  const validarFormulario = () => {
    let newErrors = {};

    // 🔹 IDENTIFICACIÓN
    if (form.idType === "RUC" && !validarRuc(form.identificacion)) {
      newErrors.identificacion = "RUC inválido (13 dígitos, termina en 001)";
    }

    if (form.idType === "Cédula" && !validarCedula(form.identificacion)) {
      newErrors.identificacion = "Cédula ecuatoriana inválida";
    }

    // 🔹 RAZÓN SOCIAL
    if (!form.razonSocial.trim()) {
      newErrors.razonSocial = "Ingrese la razón social";
    }

    // 🔹 TELÉFONO
    if (!validarTelefono(form.telefono)) {
      newErrors.telefono = "Teléfono inválido (solo números 7-10 dígitos)";
    }

    // 🔹 EMAIL
    if (!validarEmail(form.email)) {
      newErrors.email = "Correo electrónico inválido";
    }

    // 🔹 DIRECCIÓN
    if (!form.direccion.trim()) {
      newErrors.direccion = "Ingrese la dirección";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validarFormulario()) return;

    try {
      const duplicados = await validarDuplicadoProveedor(
        form.identificacion,
        form.email
      );

      // En modo editar, excluir al propio proveedor
      const otros =
        mode === "edit" && proveedorId
          ? duplicados.filter((p) => p.id !== proveedorId)
          : duplicados;

      if (otros.length > 0) {
        let newErrors = {};

        const mismaIdentificacion = otros.find(
          (p) => p.identificacion === form.identificacion
        );
        if (mismaIdentificacion) {
          newErrors.identificacion = "Esta identificación ya está registrada";
        }

        const mismoEmail = otros.find((p) => p.email === form.email);
        if (mismoEmail) {
          newErrors.email = "Este correo ya está registrado";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
      }

      // ✅ SI TODO OK
      onSave(form);
    } catch (error) {
      console.error("Error validando duplicados", error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="supplier-modal-overlay">
      <div className="supplier-modal-container">
        <h2 className="modal-title">
          {mode === "create" ? "Nuevo Proveedor" : "Editar Proveedor"}
        </h2>

        <p className="modal-subtext">
          Registro de proveedor o empresa proveedora
        </p>

        <div className="form-grid">
          <div>
            <label>Tipo de Identificación:</label>
            <select
              name="idType"
              value={form.idType}
              onChange={handleChange}
              disabled={mode === "edit"}
            >
              <option>RUC</option>
              <option>Cédula</option>
            </select>
          </div>

          <div>
            <label>Número de Identificación:</label>
            <input
              name="identificacion"
              value={form.identificacion}
              onChange={handleChange}
              disabled={mode === "edit"}
            />
            {errors.identificacion && (
              <span className="error">{errors.identificacion}</span>
            )}
          </div>

          <div>
            <label>Razón Social:</label>
            <input
              name="razonSocial"
              value={form.razonSocial}
              onChange={handleChange}
            />
            {errors.razonSocial && (
              <span className="error">{errors.razonSocial}</span>
            )}
          </div>

          <div>
            <label>Nombre Comercial:</label>
            <input
              name="nombreComercial"
              value={form.nombreComercial}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Teléfono:</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
            />
            {errors.telefono && (
              <span className="error">{errors.telefono}</span>
            )}
          </div>

          <div>
            <label>Email:</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="full-width">
            <label>Dirección:</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
            />
            {errors.direccion && (
              <span className="error">{errors.direccion}</span>
            )}
          </div>
        </div>

        <div className="modal-buttons">
          <button onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn-save">
            {mode === "create" ? "Guardar Proveedor" : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
