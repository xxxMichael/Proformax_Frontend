import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ViewProformaModal from "../components/ViewProformaModal";
import { getProformas } from "../services/proformaService";
import { getClientes } from "../services/clientService";
import { getProductos } from "../services/productService";
import { getProveedores } from "../services/supplierService";
import { 
  FileText, 
  Users, 
  Package, 
  Truck, 
  PlusCircle, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Eye, 
  Calendar,
  CheckCircle2,
  DollarSign,
  Briefcase
} from "lucide-react";
import toast from "react-hot-toast";
import "./home.css";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    proformasTotal: 0,
    proformasMontoAceptado: 0,
    clientesTotal: 0,
    productosTotal: 0,
    proveedoresTotal: 0,
    recentProformas: [],
  });

  const [selectedProforma, setSelectedProforma] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    loadDashboardData();

    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [proformasResp, clientesResp, productosResp, proveedoresResp] = await Promise.all([
        getProformas(1, 100, "", ""),
        getClientes(1, 1, ""),
        getProductos(1, 1, "", ""),
        getProveedores(1, 1, "")
      ]);

      const proformas = proformasResp?.data || [];
      
      // Calcular monto de proformas aceptadas
      const montoAceptado = proformas
        .filter(p => p.estado === "ACEPTADA")
        .reduce((sum, p) => sum + Number(p.totalFinal || 0), 0);

      // Obtener las 5 proformas más recientes
      const recientes = [...proformas]
        .sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision))
        .slice(0, 5);

      setStats({
        proformasTotal: proformasResp?.total || proformas.length,
        proformasMontoAceptado: montoAceptado,
        clientesTotal: clientesResp?.total || 0,
        productosTotal: productosResp?.total || 0,
        proveedoresTotal: proveedoresResp?.total || 0,
        recentProformas: recientes,
      });

    } catch (error) {
      console.error("Error cargando datos del dashboard", error);
      toast.error("Error al cargar los datos del panel");
    } finally {
      setLoading(false);
    }
  };

  const formatLocalDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const getInitials = (nombres, apellidos) => {
    const n = nombres ? nombres.charAt(0).toUpperCase() : "";
    const a = apellidos ? apellidos.charAt(0).toUpperCase() : "";
    return `${n}${a}` || "👤";
  };

  const handleOpenView = (proforma) => {
    setSelectedProforma(proforma);
    setIsViewModalOpen(true);
  };

  const formattedDateString = currentDateTime.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="home-dashboard-container">
          {loading ? (
            <div className="dashboard-loading">
              <div className="spinner"></div>
              <p>Cargando panel de control...</p>
            </div>
          ) : (
            <>
              {/* ========== WELCOME BANNER ========== */}
              <div className="welcome-banner">
                <div className="welcome-info">
                  <h1>
                    ¡Bienvenido de vuelta, {currentUser?.username || "Usuario"}! 👋
                  </h1>
                  <p className="welcome-subtitle">
                    <span>Panel de control general de Arte Parquet G&G</span>
                    <span className={`user-badge-role ${currentUser?.rol?.toLowerCase()}`}>
                      Rol: {currentUser?.rol || "VENDEDOR"}
                    </span>
                  </p>
                </div>
                <div className="datetime-display">
                  <Calendar size={18} />
                  <span style={{ textTransform: 'capitalize' }}>{formattedDateString}</span>
                </div>
              </div>

              {/* ========== QUICK ACTIONS ========== */}
              <div className="quick-actions-section">
                <h3 className="section-title">
                  <PlusCircle size={20} color="#19857b" />
                  <span>Acciones Rápidas</span>
                </h3>
                <div className="quick-actions-grid">
                  <button className="btn-quick-action" onClick={() => window.location.href = '/proformas'}>
                    <div className="quick-action-icon"><FileText size={22} /></div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Nueva Proforma</div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>Crear cotización</div>
                    </div>
                  </button>

                  <button className="btn-quick-action" onClick={() => window.location.href = '/clients'}>
                    <div className="quick-action-icon"><Users size={22} /></div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Nuevo Cliente</div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>Registrar comprador</div>
                    </div>
                  </button>

                  <button className="btn-quick-action" onClick={() => window.location.href = '/products'}>
                    <div className="quick-action-icon"><Package size={22} /></div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Nuevo Producto</div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>Añadir al inventario</div>
                    </div>
                  </button>

                  <button className="btn-quick-action" onClick={() => window.location.href = '/suppliers'}>
                    <div className="quick-action-icon"><Truck size={22} /></div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Proveedores</div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>Ver directorio</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* ========== KPI CARDS GRID ========== */}
              <div className="kpi-grid">
                <div className="kpi-card proformas">
                  <div className="kpi-header">
                    <span className="kpi-title">Proformas Totales</span>
                    <div className="kpi-icon"><FileText size={24} /></div>
                  </div>
                  <div className="kpi-value">
                    {stats.proformasTotal}
                  </div>
                  <div className="kpi-subtext">
                    <DollarSign size={14} color="#10b981" />
                    <span><strong>${stats.proformasMontoAceptado.toFixed(2)}</strong> en proformas aceptadas</span>
                  </div>
                </div>

                <div className="kpi-card clientes">
                  <div className="kpi-header">
                    <span className="kpi-title">Clientes Registrados</span>
                    <div className="kpi-icon"><Users size={24} /></div>
                  </div>
                  <div className="kpi-value">
                    {stats.clientesTotal}
                  </div>
                  <div className="kpi-subtext">
                    <TrendingUp size={14} color="#10b981" />
                    <span>Directorio comercial activo</span>
                  </div>
                </div>

                <div className="kpi-card productos">
                  <div className="kpi-header">
                    <span className="kpi-title">Productos / Servicios</span>
                    <div className="kpi-icon"><Package size={24} /></div>
                  </div>
                  <div className="kpi-value">
                    {stats.productosTotal}
                  </div>
                  <div className="kpi-subtext">
                    <CheckCircle2 size={14} color="#10b981" />
                    <span>Catálogo e inventario al día</span>
                  </div>
                </div>

                <div className="kpi-card proveedores">
                  <div className="kpi-header">
                    <span className="kpi-title">Proveedores Activos</span>
                    <div className="kpi-icon"><Truck size={24} /></div>
                  </div>
                  <div className="kpi-value">
                    {stats.proveedoresTotal}
                  </div>
                  <div className="kpi-subtext">
                    <Briefcase size={14} color="#f59e0b" />
                    <span>Red de suministro y logística</span>
                  </div>
                </div>
              </div>

              {/* ========== RECENT PROFORMAS & OVERVIEW ========== */}
              <div className="dashboard-grid-main">
                {/* Columna Izquierda: Tabla Recientes */}
                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h3 className="section-title" style={{ margin: 0 }}>
                      <Clock size={20} color="#3b82f6" />
                      <span>Proformas Recientes</span>
                    </h3>
                    <button className="btn-view-all" onClick={() => window.location.href = '/proformas'}>
                      <span>Ver todas</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <table className="recent-table">
                    <thead>
                      <tr>
                        <th>Proforma</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Total</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentProformas.length > 0 ? (
                        stats.recentProformas.map((p) => (
                          <tr key={p.id}>
                            <td className="proforma-num">{p.numeroProforma}</td>
                            <td>
                              <div className="client-name-cell">
                                <div className="client-avatar-mini">
                                  {getInitials(p.cliente?.nombres, p.cliente?.apellidosRazonSocial)}
                                </div>
                                <span style={{ fontWeight: 600, color: '#334155' }}>
                                  {p.cliente ? `${p.cliente.nombres} ${p.cliente.apellidosRazonSocial}` : "N/A"}
                                </span>
                              </div>
                            </td>
                            <td>{formatLocalDate(p.fechaEmision)}</td>
                            <td>
                              <span className={`badge-status-mini ${p.estado.toLowerCase()}`}>
                                {p.estado}
                              </span>
                            </td>
                            <td className="amount-cell">${Number(p.totalFinal || 0).toFixed(2)}</td>
                            <td>
                              <button 
                                className="btn-mini-view"
                                onClick={() => handleOpenView(p)}
                                title="Ver detalle de proforma"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            📋 Aún no hay proformas registradas. ¡Crea tu primera proforma desde el menú lateral!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Columna Derecha: Tips / Información Rápida */}
                <div className="dashboard-card">
                  <h3 className="section-title" style={{ marginBottom: '20px' }}>
                    <TrendingUp size={20} color="#10b981" />
                    <span>Resumen Operativo</span>
                  </h3>
                  
                  <div className="info-card-content">
                    <div className="info-item">
                      <div className="info-icon"><FileText size={20} /></div>
                      <div className="info-text">
                        <h4>Gestión de Proformas</h4>
                        <p>Genera cotizaciones profesionales al instante con cálculo automático de IVA y descuentos.</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon"><Users size={20} /></div>
                      <div className="info-text">
                        <h4>Directorio de Clientes</h4>
                        <p>Mantén un registro centralizado de tus compradores para agilizar futuras emisiones.</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <div className="info-icon"><Package size={20} /></div>
                      <div className="info-text">
                        <h4>Control de Inventario</h4>
                        <p>Administra precios base y existencias de tablones, parquet, adhesivos y servicios de instalación.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Vista de Proforma */}
      <ViewProformaModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        proformaId={selectedProforma?.id}
      />
    </div>
  );
}