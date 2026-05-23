import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowLoggedUsersToRedirect }) {
  const token = localStorage.getItem("token");

  // Si intentamos entrar al Login ("/") y ya estamos logueados, nos manda al /home
  if (allowLoggedUsersToRedirect && token) {
    return <Navigate to="/home" replace />;
  }

  // Si no estamos logueados y queremos entrar a una ruta protegida, nos manda al Login ("/")
  if (!allowLoggedUsersToRedirect && !token) {
    return <Navigate to="/" replace />;
  }

  // Si todo está correcto, renderizamos la página (children)
  return children;
}
