import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useLayout } from "../context/LayoutContext";
import "./header.css";
import imagenDefault from "../images/arte_parquet_gg.jpg";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleMobileMenu } = useLayout();
  const [openMenu, setOpenMenu] = useState(false);
  const [logo, setLogo] = useState(
    () => localStorage.getItem("empresa_logo") || imagenDefault
  );

  useEffect(() => {
    const handleLogoUpdate = () => {
      const saved = localStorage.getItem("empresa_logo");
      if (saved) setLogo(saved);
    };
    window.addEventListener("logo_updated", handleLogoUpdate);
    return () => window.removeEventListener("logo_updated", handleLogoUpdate);
  }, []);

  const pageTitles = {
    "/home": "Inicio",
    "/proformas": "Proformas",
    "/clients": "Clientes",
    "/products": "Productos",
    "/suppliers": "Proveedores",
    "/reports": "Reportes",
    "/configuration": "Configuración",
    "/users": "Usuarios",
    "/facturas": "Facturas",
  };

  const title = pageTitles[location.pathname] || "Página";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <Menu size={24} />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-profile" onClick={() => setOpenMenu(!openMenu)}>
        <img src={logo} alt="logo" className="profile-img" />
        <span className="profile-name">Aarte Parquete G y G</span>

        {/* Menu desplegable */}
        {openMenu && (
          <div className="profile-menu">
            <button className="logout-btn" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}