import { useState } from "react";
import { loginRequest } from "../services/authService";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (username, password) => {
    setLoading(true);
    setError("");

    try {
      const resp = await loginRequest(username, password);

      if (resp.success) {
        // Guardar token en localStorage
        localStorage.setItem("token", resp.data.token);
        localStorage.setItem("user", JSON.stringify(resp.data.usuario));

        return true;
      }
      return false;
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};