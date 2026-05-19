import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import "./login.css";

export default function Login() {
  const { login, loading, error } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 NUEVO

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.username || !form.password) {
      setFormError("Debe ingresar usuario y contraseña.");
      return;
    }

    const result = await login(form.username, form.password);

    if (result) {
      window.location.href = "/home";
    }
  };

  return (
    <div className="login-container">
      {/* Sidebar */}
      <div className="login-sidebar">
        <h2>PROFORMAX</h2>
      </div>

      {/* Formulario */}
      <div className="login-content">
        <div className="login-box">
          <h2>Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>
            <label>Usuario:</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
            />

            <label>Contraseña:</label>

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}   // 👈 CAMBIA AQUÍ
                name="password"
                value={form.password}
                onChange={handleChange}
              />

              <span
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            {formError && <p className="error">{formError}</p>}
            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}