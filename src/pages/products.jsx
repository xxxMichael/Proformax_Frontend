import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Products() {
  return (
    <div className="layout">
      <Sidebar />
      <div style={{ width: "100%" }}>
        <Header />

        {/* Contenido */}
        <div className="productos-content">
          <h1 className="productos-title">Productos</h1>
        </div>
      </div>
    </div>
  );
}