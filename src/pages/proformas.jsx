import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Proformas() {
  return (
    <div className="layout">
      <Sidebar />
      <div style={{ width: "100%" }}>
        <Header />

        {/* Contenido */}
        <div className="proformas-content">
          <h1 className="proformas-title">Proformas</h1>
        </div>
      </div>
    </div>
  );
}