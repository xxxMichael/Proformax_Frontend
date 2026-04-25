import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Configuracion() {
  return (
    <div className="layout">
      <Sidebar />
      <div style={{ width: "100%" }}>
        <Header />

        {/* Contenido */}
        <div className="configuracion-content">
          <h1 className="configuracion-title">Configuración</h1>
        </div>
      </div>
    </div>
  );
}