import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./header.css";
import imagen from "../images/arte_parquet_gg.jpg";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);

  const pageTitles = {
    "/home": "Inicio",
    "/proformas": "Proformas",
    "/clients": "Clientes",
    "/products": "Productos",
    "/suppliers": "Proveedores",
    "/reports": "Reportes",
    "/configuration": "Configuración",
  };

  const title = pageTitles[location.pathname] || "Página";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="header">
      <h1 className="header-title">{title}</h1>

      <div className="header-profile" onClick={() => setOpenMenu(!openMenu)}>
        <img src={imagen} alt="profile" className="profile-img" />
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