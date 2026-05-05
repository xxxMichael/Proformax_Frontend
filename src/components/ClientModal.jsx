import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./clientModal.css";
import { validarDuplicadoCliente } from "../services/clientService";

// 🔹 VALIDADORES
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

const validarRuc = (ruc) => {
  if (!/^\d{13}$/.test(ruc)) return false;

  const cedula = ruc.substring(0, 10);
  const sufijo = ruc.substring(10);

  return validarCedula(cedula) && sufijo === "001";
};

const validarPasaporte = (pasaporte) => {
  return /^[A-Za-z0-9]{5,15}$/.test(pasaporte);
};

const validarEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validarTelefono = (tel) => {
  return /^[0-9]{7,10}$/.test(tel);
};

export default function ClientModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
  clienteId = null,
}) {
  const emptyForm = {
    clientType: "natural",
    idType: "Cédula",
    idNumber: "",
    names: "",
    lastnames: "",
    phone: "",
    email: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    // Limpiar errores al abrir el modal
    setErrors({});

    if (mode === "create") {
      // Siempre limpiar campos al abrir en modo crear
      setForm({ ...emptyForm });
    } else if (initialData) {
      // En modo editar, cargar datos del cliente
      setForm({
        clientType: initialData.clientType || "natural",
        idType: initialData.idType || "Cédula",
        idNumber: initialData.idNumber || "",
        names: initialData.names || "",
        lastnames: initialData.lastnames || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    let value = e.target.value;

    // 🔹 SOLO NÚMEROS PARA TELÉFONO Y CÉDULA/RUC
    if (e.target.name === "phone" || e.target.name === "idNumber") {
      value = value.replace(/\D/g, "");
    }

    setForm({ ...form, [e.target.name]: value });
  };

  const validarFormulario = () => {
    let newErrors = {};

    // 🔹 IDENTIFICACIÓN
    if (form.idType === "Cédula" && !validarCedula(form.idNumber)) {
      newErrors.idNumber = "Cédula ecuatoriana inválida";
    }

    if (form.idType === "RUC" && !validarRuc(form.idNumber)) {
      newErrors.idNumber = "RUC inválido (debe terminar en 001)";
    }

    if (form.idType === "Pasaporte" && !validarPasaporte(form.idNumber)) {
      newErrors.idNumber = "Pasaporte inválido";
    }

    // 🔹 TELÉFONO
    if (!validarTelefono(form.phone)) {
      newErrors.phone = "Teléfono inválido (solo números 7-10 dígitos)";
    }

    // 🔹 EMAIL
    if (!validarEmail(form.email)) {
      newErrors.email = "Correo electrónico inválido";
    }

    // 🔹 CAMPOS VACÍOS
    if (!form.names) newErrors.names = "Ingrese nombres";
    if (!form.lastnames) newErrors.lastnames = "Ingrese apellidos";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validarFormulario()) return;

    try {
      const duplicados = await validarDuplicadoCliente(
        form.idNumber,
        form.email
      );

      // En modo editar, excluir al propio cliente de la validación
      const otrosClientes = mode === "edit" && clienteId
        ? duplicados.filter((c) => c.id !== clienteId)
        : duplicados;

      if (otrosClientes.length > 0) {
        let newErrors = {};

        // Verificar si algún OTRO cliente tiene la misma identificación
        const mismaIdentificacion = otrosClientes.find(
          (c) => c.identificacion === form.idNumber
        );
        if (mismaIdentificacion) {
          newErrors.idNumber = "Esta identificación ya está registrada";
        }

        // Verificar si algún OTRO cliente tiene el mismo email
        const mismoEmail = otrosClientes.find(
          (c) => c.email === form.email
        );
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
    <div className="modal-overlay">
      <div className="modal-container">

        <h2 className="modal-title">
          {mode === "create" ? "Nuevo Cliente" : "Editar Cliente"}
        </h2>

        <p className="modal-subtext">
          Registro de nueva entidad o persona natural
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
              <option>Cédula</option>
              <option>RUC</option>
              <option>Pasaporte</option>
            </select>
          </div>

          <div>
            <label>Número de Identificación:</label>
            <input
              name="idNumber"
              value={form.idNumber}
              onChange={handleChange}
              disabled={mode === "edit"}
            />
            {errors.idNumber && <span className="error">{errors.idNumber}</span>}
          </div>

          <div>
            <label>Nombres:</label>
            <input name="names" value={form.names} onChange={handleChange} />
            {errors.names && <span className="error">{errors.names}</span>}
          </div>

          <div>
            <label>Apellidos:</label>
            <input name="lastnames" value={form.lastnames} onChange={handleChange} />
            {errors.lastnames && <span className="error">{errors.lastnames}</span>}
          </div>

          <div>
            <label>Teléfono:</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div>
            <label>Email:</label>
            <input name="email" value={form.email} onChange={handleChange} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

        </div>

        <div className="modal-buttons">
          <button onClick={onClose} className="btn-cancel">Cancelar</button>
          <button onClick={handleSave} className="btn-save">
            {mode === "create" ? "Guardar Cliente" : "Guardar Cambios"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}