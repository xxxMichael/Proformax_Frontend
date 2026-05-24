import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { resetPasswordRequest } from "../services/authService";
import toast from "react-hot-toast";
import "./resetPassword.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      setFormError("Token inválido o no proporcionado.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!password || !confirmPassword) {
      setFormError("Debe llenar todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordRequest(token, password);
      setSuccess(true);
      toast.success("Contraseña restablecida con éxito");
    } catch (error) {
      setFormError(error.message || "Error al restablecer la contraseña");
      toast.error("Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      {/* Sidebar */}
      <div className="reset-password-sidebar">
        <h2>PROFORMAX</h2>
        <p>Restablecimiento de Contraseña</p>
      </div>

      {/* Formulario */}
      <div className="reset-password-content">
        <div className="reset-password-box">
          {!token ? (
            <div className="invalid-token-state">
              <AlertTriangle size={48} color="#ef4444" style={{ margin: "0 auto 20px auto", display: "block" }} />
              <h2>Enlace Inválido</h2>
              <p>El enlace de recuperación es inválido, está mal escrito o ya expiró.</p>
              <Link to="/forgot-password" className="btn-return">Solicitar nuevo enlace</Link>
            </div>
          ) : success ? (
            <div className="reset-password-success">
              <div className="success-icon">
                <CheckCircle size={48} />
              </div>
              <h3>¡Contraseña Actualizada!</h3>
              <p>
                Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tus nuevas credenciales.
              </p>
              <Link to="/" className="btn-return">Iniciar Sesión</Link>
            </div>
          ) : (
            <>
              <h2>Crea tu nueva contraseña</h2>
              <p className="reset-password-description">
                Ingresa y confirma tu nueva contraseña de acceso.
              </p>

              <form onSubmit={handleSubmit}>
                <label>Nueva Contraseña:</label>
                <div className="password-container-reset">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <span className="eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>

                <label>Confirmar Contraseña:</label>
                <div className="password-container-reset">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Vuelve a escribir la contraseña"
                  />
                  <span className="eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>

                <div className="password-requirements">
                  Requisitos sugeridos:
                  <ul>
                    <li>Al menos 6 caracteres</li>
                    <li>Incluir un número o símbolo</li>
                  </ul>
                </div>

                {formError && <p className="error-text">{formError}</p>}

                <button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Nueva Contraseña"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
