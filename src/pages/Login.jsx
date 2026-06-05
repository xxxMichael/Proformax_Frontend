import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const [showPassword, setShowPassword] = useState(false);

  // --- LÓGICA DE BLOQUEO ANTI-FUERZA BRUTA ---
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 10000; // 10 segundos

  const [attempts, setAttempts] = useState(() => parseInt(localStorage.getItem("login_attempts") || "0"));
  const [lockoutTime, setLockoutTime] = useState(() => parseInt(localStorage.getItem("login_lockout_time") || "0"));
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  useEffect(() => {
    let interval;
    if (lockoutTime > 0) {
      const checkLockout = () => {
        const now = Date.now();
        const timePassed = now - lockoutTime;
        if (timePassed >= LOCKOUT_DURATION_MS) {
          // Bloqueo expirado
          setLockoutTime(0);
          setAttempts(0);
          setLockoutCountdown(0);
          localStorage.removeItem("login_lockout_time");
          localStorage.setItem("login_attempts", "0");
          setFormError("");
        } else {
          // Actualizar cuenta regresiva
          setLockoutCountdown(Math.ceil((LOCKOUT_DURATION_MS - timePassed) / 1000));
        }
      };

      checkLockout(); // Validar inmediatamente
      interval = setInterval(checkLockout, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTime]);
  // ------------------------------------------

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (lockoutTime > 0) {
      setFormError(`Demasiados intentos. Intente en ${lockoutCountdown} segundos.`);
      return;
    }

    if (!form.username || !form.password) {
      setFormError("Debe ingresar usuario y contraseña.");
      return;
    }

    const result = await login(form.username, form.password);

    if (result) {
      // Exitoso: Limpiar penalizaciones
      setAttempts(0);
      localStorage.setItem("login_attempts", "0");
      localStorage.removeItem("login_lockout_time");
      window.location.href = "/home";
    } else {
      // Fallido: Registrar intento
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("login_attempts", newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const now = Date.now();
        setLockoutTime(now);
        localStorage.setItem("login_lockout_time", now.toString());
        setFormError(`Demasiados intentos. Inicio bloqueado.`);
      } else {
        setFormError(`Aviso: Quedan ${MAX_ATTEMPTS - newAttempts} intentos.`);
      }
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

            <button 
              type="submit" 
              disabled={loading || lockoutTime > 0} 
              style={lockoutTime > 0 ? {backgroundColor: '#9ca3af', cursor: 'not-allowed'} : {}}
            >
              {loading ? "Cargando..." : (lockoutTime > 0 ? `Bloqueado (${lockoutCountdown}s)` : "Iniciar Sesión")}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/forgot-password" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}