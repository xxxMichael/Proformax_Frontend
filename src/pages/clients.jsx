import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Clientes() {
  return (
    <div className="layout">
      <Sidebar />
      <div style={{ width: "100%" }}>
        <Header />

        {/* Contenido */}
        <div className="clientes-content">
          <h1 className="clientes-title">Clientes</h1>
        </div>
      </div>
    </div>
  );
}