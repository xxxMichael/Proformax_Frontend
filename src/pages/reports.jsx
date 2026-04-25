import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Reportes() {
  return (
    <div className="layout">
      <Sidebar />
      <div style={{ width: "100%" }}>
        <Header />

        {/* Contenido */}
        <div className="reportes-content">
          <h1 className="reportes-title">Reportes</h1>
        </div>
      </div>
    </div>
  );
}