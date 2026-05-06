import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [logo, setLogo] = useState(
    () => localStorage.getItem("empresa_logo") || null
  );

  useEffect(() => {
    const handleLogoUpdate = () => {
      const saved = localStorage.getItem("empresa_logo");
      if (saved) setLogo(saved);
    };
    window.addEventListener("logo_updated", handleLogoUpdate);
    return () => window.removeEventListener("logo_updated", handleLogoUpdate);
  }, []);

  const menu = [
    { name: "Inicio", path: "/home" },
    { name: "Proformas", path: "/proformas" },
    { name: "Clientes", path: "/clients" },
    { name: "Productos", path: "/products" },
    { name: "Proveedores", path: "/suppliers" },
    { name: "Reportes", path: "/reports" },
    { name: "Configuración", path: "/configuration" },
  ];

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      
      {/* Header */}
      <div className="sidebar-header">
        {logo && !collapsed && (
          <img src={logo} alt="logo empresa" className="sidebar-logo" />
        )}
        {!logo && !collapsed && <h2>PROFORMAX</h2>}

        <button
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          ☰
        </button>
      </div>

      {/* Menú */}
      <ul className="sidebar-menu">
        {menu.map((item) => (
          <li
            key={item.path}
            className={location.pathname === item.path ? "active" : ""}
          >
            <Link to={item.path}>
              {!collapsed ? item.name : item.name.charAt(0)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}