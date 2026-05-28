import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./layout.css";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/home";
import Proformas from "./pages/proformas";
import Clientes from "./pages/clients";
import Productos from "./pages/products";
import Proveedores from "./pages/suppliers";
import Facturas from "./pages/facturas";
import Reportes from "./pages/reports";
import Configuracion from "./pages/configuration";
import Usuarios from "./pages/users";
import ProtectedRoute from "./components/ProtectedRoute";
import { LayoutProvider } from "./context/LayoutContext";

export default function App() {
  return (
    <LayoutProvider>
      <BrowserRouter>
        <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />

        <Routes>
          {/* Ruta pública (Login): Si ya tiene token, lo manda a /home */}
          <Route path="/" element={
            <ProtectedRoute allowLoggedUsersToRedirect>
              <Login />
            </ProtectedRoute>
          } />
          
          <Route path="/forgot-password" element={
            <ProtectedRoute allowLoggedUsersToRedirect>
              <ForgotPassword />
            </ProtectedRoute>
          } />

          <Route path="/reset-password" element={
            <ProtectedRoute allowLoggedUsersToRedirect>
              <ResetPassword />
            </ProtectedRoute>
          } />

          {/* Rutas Protegidas: Si NO tiene token, lo manda a / */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/proformas" element={<ProtectedRoute><Proformas /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Proveedores /></ProtectedRoute>} />
          <Route path="/facturas" element={<ProtectedRoute><Facturas /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
          <Route path="/configuration" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          
          {/* Ruta fallback por si escribe cualquier otra URL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LayoutProvider>
  );
}