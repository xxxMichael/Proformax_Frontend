import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./home.css";
import imagen from "../images/arte_parquet_gg.jpg";

export default function Home() {
  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar />
      <div style={{ width: "100%" }}>
        <Header />

      {/* Contenido */}
      <div className="home-content">
        <h1 className="home-title">
          BIENVENID@ SISTEMA PROFORMAX
        </h1>

        <img 
          src={imagen} 
          alt="Logo Empresa" 
          className="home-logo"
        />

        <div className="home-buttons">
          <button onClick={() => window.location.href='/proformas'}>Proformas</button>
          <button onClick={() => window.location.href='/clients'}>Clientes</button>
          <button onClick={() => window.location.href='/products'}>Productos</button>
          <button onClick={() => window.location.href='/suppliers'}>Proveedores</button>
        </div>
      </div>
    </div>
    </div>
  );
}