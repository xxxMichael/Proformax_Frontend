import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle } from "lucide-react";
import { forgotPasswordRequest } from "../services/authService";
import toast from "react-hot-toast";
import "./forgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Debe ingresar un correo electrónico");
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordRequest(email);
      setSuccess(true);
    } catch (error) {
      toast.error(error.message || "Error al solicitar la recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      {/* Sidebar (Mismo estilo oscuro que el Login) */}
      <div className="forgot-password-sidebar">
        <h2>PROFORMAX</h2>
        <p>Recuperación de Acceso</p>
      </div>

      {/* Formulario */}
      <div className="forgot-password-content">
        <div className="forgot-password-box">
          {success ? (
            <div className="forgot-password-success">
              <div className="success-icon">
                <CheckCircle size={48} />
              </div>
              <h3>¡Solicitud Enviada!</h3>
              <p>
                Si el correo <strong>{email}</strong> está registrado en nuestro sistema,
                recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <Link to="/" className="btn-return">Volver al Inicio de Sesión</Link>
            </div>
          ) : (
            <>
              <h2>¿Olvidaste tu contraseña?</h2>
              <p className="forgot-password-description">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit}>
                <label>Correo Electrónico:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  required
                />

                <button type="submit" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
                </button>
              </form>

              <Link to="/" className="back-to-login">
                Volver al Inicio de Sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
