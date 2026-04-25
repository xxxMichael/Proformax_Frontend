import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Proveedores() {
  return (
    <div className="layout">
      <Sidebar />
      <div style={{ width: "100%" }}>
        <Header />

        {/* Contenido */}
        <div className="proveedores-content">
          <h1 className="proveedores-title">Proveedores</h1>
        </div>
      </div>
    </div>
  );
}