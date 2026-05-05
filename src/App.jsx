import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Home from "./pages/home";
import Proformas from "./pages/proformas";
import Clientes from "./pages/clients";
import Productos from "./pages/products";
import Proveedores from "./pages/suppliers";
import Reportes from "./pages/reports";
import Configuracion from "./pages/configuration";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/proformas" element={<Proformas />} />
        <Route path="/clients" element={<Clientes />} />
        <Route path="/products" element={<Productos />} />
        <Route path="/suppliers" element={<Proveedores />} />
        <Route path="/reports" element={<Reportes />} />
        <Route path="/configuration" element={<Configuracion />} />
      </Routes>
    </BrowserRouter>
  );
}