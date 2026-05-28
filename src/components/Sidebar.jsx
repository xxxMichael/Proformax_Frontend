import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLayout } from "../context/LayoutContext";
import { Users, Package, FileText, Settings, X, Home, User, Truck, FileBarChart } from "lucide-react";
import "./sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobileMenuOpen, closeMobileMenu } = useLayout();
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

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const menu = [
    { name: "Inicio", path: "/home", icon: <Home size={20} /> },
    { name: "Proformas", path: "/proformas", icon: <FileText size={20} /> },
    { name: "Clientes", path: "/clients", icon: <User size={20} /> },
    { name: "Productos", path: "/products", icon: <Package size={20} /> },
    { name: "Proveedores", path: "/suppliers", icon: <Truck size={20} /> },
    { name: "Facturas", path: "/facturas", icon: <FileText size={20} /> },
    { name: "Reportes", path: "/reports", icon: <FileBarChart size={20} /> },
  ];

  if (user?.rol === "ADMIN") {
    menu.push({ name: "Usuarios", path: "/users", icon: <Users size={20} /> });
  }

  menu.push({ name: "Configuración", path: "/configuration", icon: <Settings size={20} /> });

  return (
    <>
      <div className={`sidebar ${collapsed ? "collapsed" : ""} ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        
        {/* Header */}
        <div className="sidebar-header">
          <button className="close-mobile-btn" onClick={closeMobileMenu}>
            <X size={24} />
          </button>
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
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  closeMobileMenu();
                }}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay para móviles */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}
    </>
  );
}