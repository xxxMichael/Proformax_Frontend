import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./UserModal.css";

export default function UserModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
}) {
  const emptyForm = {
    username: "",
    password: "",
    rol: "vendedor",
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});

    if (mode === "create") {
      setForm({ ...emptyForm });
    } else if (initialData) {
      setForm({
        username: initialData.username || "",
        password: "", // En edición la contraseña es opcional
        rol: initialData.rol || "vendedor",
      });
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validarFormulario = () => {
    let newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Ingrese un nombre de usuario";
    }

    if (mode === "create") {
      if (!form.password) {
        newErrors.password = "La contraseña es obligatoria para nuevos usuarios";
      } else if (form.password.length < 8) {
        newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      }
    } else if (form.password && form.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (!form.rol) {
      newErrors.rol = "Seleccione un rol";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validarFormulario()) return;
    onSave(form);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="user-modal-overlay">
      <div className="user-modal-container">
        <h2>{mode === "create" ? "Nuevo Usuario" : "Editar Usuario"}</h2>
        <p className="user-modal-subtext">
          {mode === "create"
            ? "Cree las credenciales y asigne un rol de acceso"
            : "Actualice los datos o el rol del usuario"}
        </p>

        <div className="user-form-grid">
          <div className="user-form-group">
            <label>Nombre de Usuario:</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Ej: vendedor01"
              disabled={mode === "edit"} // El username no suele cambiar, o si cambia se habilita
            />
            {errors.username && <span className="error">{errors.username}</span>}
          </div>

          <div className="user-form-group">
            <label>{mode === "create" ? "Contraseña:" : "Nueva Contraseña (Opcional):"}</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={mode === "create" ? "Contraseña segura..." : "Dejar en blanco para no cambiar"}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="user-form-group">
            <label>Rol en el Sistema:</label>
            <select name="rol" value={form.rol} onChange={handleChange}>
              <option value="vendedor">Vendedor</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
            </select>
            {errors.rol && <span className="error">{errors.rol}</span>}
          </div>
        </div>

        <div className="user-modal-buttons">
          <button onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn-save">
            {mode === "create" ? "Crear Usuario" : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
