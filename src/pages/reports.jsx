import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { 
  FileText, TrendingUp, Package, Users, DollarSign, 
  AlertTriangle, Filter, CheckCircle2, SearchX 
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import toast from "react-hot-toast";

import {
  getReporteProformas,
  getVentasPorCliente,
  getProductosMasVendidos,
  getReporteInventario,
  getRentabilidad
} from "../services/reportService";

import "./reports.css";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function Reportes() {
  const [activeTab, setActiveTab] = useState("proformas");
  const [loading, setLoading] = useState(false);

  // Filtros globales
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estado, setEstado] = useState("");
  
  // Data states
  const [proformasData, setProformasData] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [ventasData, setVentasData] = useState([]);
  const [productosTopData, setProductosTopData] = useState([]);
  const [inventarioData, setInventarioData] = useState([]);
  const [rentabilidadData, setRentabilidadData] = useState([]);

  // Paginación local para proformas
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page]); // Solo re-fetch on page change, filters are handled by submit button

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters = {
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      };

      const [respProformas, respVentas, respProductos, respInventario, respRentabilidad] = await Promise.all([
        getReporteProformas({ ...filters, estado, page, limit: 10 }),
        getVentasPorCliente(filters),
        getProductosMasVendidos({ ...filters, limit: 10 }),
        getReporteInventario({ stockBajo: 10, diasSinMovimiento: 30 }),
        getRentabilidad({ ...filters, agrupadoPor: 'producto' })
      ]);

      setProformasData(respProformas);

      setVentasData(respVentas.data.map(v => ({
        ...v,
        cliente_nombre: v.cliente ? `${v.cliente.nombres} ${v.cliente.apellidosRazonSocial}` : "Desconocido"
      })));

      setProductosTopData(respProductos.data.map(p => ({
        ...p,
        producto_nombre: p.producto ? p.producto.nombre : "Desconocido"
      })));

      setInventarioData(respInventario.data);

      setRentabilidadData(respRentabilidad.data.map(p => ({
        ...p,
        producto_nombre: p.producto ? p.producto.nombre : "Desconocido"
      })));

    } catch (error) {
      toast.error(error.message || "Error al cargar reporte");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    
    // Validación de fechas futuras
    const today = new Date().toISOString().split('T')[0];
    if (fechaDesde && fechaDesde > today) {
      toast.error("La fecha de inicio no puede ser mayor a la de hoy");
      return;
    }
    if (fechaHasta && fechaHasta > today) {
      toast.error("La fecha de fin no puede ser mayor a la de hoy");
      return;
    }
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      toast.error("La fecha de inicio no puede ser mayor a la fecha de fin");
      return;
    }

    setPage(1);
    fetchData();
  };

  // Función auxiliar para obtener fecha actual para el atributo max
  const getTodayString = () => new Date().toISOString().split('T')[0];

  // ==========================
  // RENDER HELPERS
  // ==========================

  const renderProformasTable = () => (
    <div className="table-container">
      <table className="premium-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {proformasData.data?.length > 0 ? (
            proformasData.data.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.numeroProforma}</strong></td>
                <td>{new Date(p.fechaEmision).toLocaleDateString()}</td>
                <td>{p.cliente ? `${p.cliente.nombres} ${p.cliente.apellidosRazonSocial}` : "N/A"}</td>
                <td>${Number(p.totalFinal).toFixed(2)}</td>
                <td>
                  <span className={`badge-estado estado-${p.estado.toLowerCase()}`}>
                    {p.estado}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" className="empty-state"><SearchX /> No hay proformas en este rango</td></tr>
          )}
        </tbody>
      </table>
      {proformasData.totalPages > 1 && (
        <div className="pagination-controls">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
          <span>Página {page} de {proformasData.totalPages}</span>
          <button disabled={page === proformasData.totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
        </div>
      )}
    </div>
  );

  const renderVentasChart = () => (
    <div className="chart-grid">
      <div className="chart-card">
        <h3><DollarSign size={20} color="#3b82f6"/> Top Clientes por Monto</h3>
        <div style={{ height: 350 }}>
          {ventasData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventasData.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(val) => `$${val}`} />
                <YAxis type="category" dataKey="cliente_nombre" width={120} tick={{fontSize: 12}} />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Bar dataKey="valorTotal" name="Monto ($)" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><SearchX /> Sin datos</div>}
        </div>
      </div>
      
      <div className="chart-card">
        <h3><Users size={20} color="#8b5cf6"/> Frecuencia de Compra</h3>
        <div style={{ height: 350 }}>
          {ventasData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ventasData.slice(0, 5)} dataKey="frecuenciaCompra" nameKey="cliente_nombre" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label paddingAngle={5}>
                  {ventasData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><SearchX /> Sin datos</div>}
        </div>
      </div>
    </div>
  );

  const renderProductosTop = () => (
    <div className="chart-card">
      <h3><TrendingUp size={20} color="#10b981"/> Productos / Servicios Más Vendidos</h3>
      <div style={{ height: 400 }}>
        {productosTopData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productosTopData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="producto_nombre" tick={{fontSize: 12}} />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="cantidadVendida" name="Cantidad Vendida" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar yAxisId="right" dataKey="valorTotal" name="Monto Generado ($)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="empty-state"><SearchX /> Sin datos</div>}
      </div>
    </div>
  );

  const renderInventario = () => (
    <div className="table-container">
      <table className="premium-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Stock Actual</th>
            <th>Estado / Alerta</th>
          </tr>
        </thead>
        <tbody>
          {inventarioData.length > 0 ? (
            inventarioData.map((inv) => {
              const isBajo = inv.enReposicion;
              const isSinMovimiento = inv.sinMovimiento;
              
              return (
                <tr key={inv.id}>
                  <td><strong>{inv.codigo}</strong></td>
                  <td>{inv.nombre}</td>
                  <td><span className="badge neutral">{inv.tipo}</span></td>
                  <td>{inv.stockActual}</td>
                  <td>
                    {isBajo ? (
                      <span className="stock-alert"><AlertTriangle size={14}/> Stock Bajo</span>
                    ) : isSinMovimiento ? (
                      <span className="stock-alert" style={{color: '#f59e0b'}}><AlertTriangle size={14}/> Sin rotación</span>
                    ) : (
                      <span className="stock-ok"><CheckCircle2 size={14}/> Saludable</span>
                    )}
                  </td>
                </tr>
              )
            })
          ) : (
            <tr><td colSpan="5" className="empty-state"><SearchX /> Inventario vacío o sin alertas críticas</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderRentabilidad = () => (
    <div className="chart-card">
      <h3><DollarSign size={20} color="#06b6d4"/> Margen Bruto por Producto (Estimado)</h3>
      <div style={{ height: 400 }}>
        {rentabilidadData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rentabilidadData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="producto_nombre" tick={{fontSize: 12}} />
              <YAxis tickFormatter={(val) => `$${val}`} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} cursor={{fill: 'transparent'}} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="revenue" name="Ventas Totales" fill="#3b82f6" maxBarSize={60} radius={[4, 4, 0, 0]} />
              <Bar dataKey="estimatedCost" name="Costo Estimado" fill="#ef4444" maxBarSize={60} radius={[4, 4, 0, 0]} />
              <Bar dataKey="grossProfit" name="Margen de Ganancia" fill="#10b981" maxBarSize={60} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="empty-state"><SearchX /> No hay datos de rentabilidad para estas fechas</div>}
      </div>
    </div>
  );

  return (
    <div className="layout">
      <Sidebar />
      <div style={{ width: "100%", overflowY: "auto" }}>
        <Header />

        <div className="reportes-container">
          <div className="reportes-header">
            <div>
              <p>Analice el desempeño general del negocio</p>
            </div>
          </div>

          {/* FILTROS GLOBALES */}
          <form className="global-filters" onSubmit={handleFilter}>
            <div className="filter-group">
              <label>Fecha Desde</label>
              <input type="date" value={fechaDesde} max={getTodayString()} onChange={e => setFechaDesde(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Fecha Hasta</label>
              <input type="date" value={fechaHasta} max={getTodayString()} onChange={e => setFechaHasta(e.target.value)} />
            </div>
            {activeTab === 'proformas' && (
              <div className="filter-group">
                <label>Estado</label>
                <select value={estado} onChange={e => setEstado(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="EMITIDA">Emitida</option>
                  <option value="ACEPTADA">Aceptada</option>
                  <option value="ANULADA">Anulada</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn-filter">
              <Filter size={16} /> Aplicar Filtros
            </button>
          </form>

          {/* KPI CARDS (Only on relevant tabs or always) */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon blue"><FileText size={24} /></div>
              <div className="kpi-info">
                <span>Total Proformas</span>
                <strong>{proformasData.total}</strong>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon green"><DollarSign size={24} /></div>
              <div className="kpi-info">
                <span>Total Ingresos (Top Clientes)</span>
                <strong>
                ${ventasData.reduce((acc, v) => acc + Number(v.valorTotal), 0).toFixed(2)}
                </strong>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon orange"><Package size={24} /></div>
              <div className="kpi-info">
                <span>Alertas de Inventario</span>
                <strong>{inventarioData.filter(i => i.enReposicion).length}</strong>
              </div>
            </div>
          </div>

          {/* PESTAÑAS */}
          <div className="reports-tabs">
            <button className={`tab-btn ${activeTab === 'proformas' ? 'active' : ''}`} onClick={() => {setActiveTab('proformas'); setPage(1);}}>
              <FileText size={16} /> Proformas
            </button>
            <button className={`tab-btn ${activeTab === 'ventas' ? 'active' : ''}`} onClick={() => setActiveTab('ventas')}>
              <Users size={16} /> Ventas por Cliente
            </button>
            <button className={`tab-btn ${activeTab === 'productos' ? 'active' : ''}`} onClick={() => setActiveTab('productos')}>
              <TrendingUp size={16} /> Productos Top
            </button>
            <button className={`tab-btn ${activeTab === 'rentabilidad' ? 'active' : ''}`} onClick={() => setActiveTab('rentabilidad')}>
              <DollarSign size={16} /> Rentabilidad
            </button>
            <button className={`tab-btn ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => setActiveTab('inventario')}>
              <Package size={16} /> Inventario
            </button>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="tab-content">
            {loading ? (
              <div className="reports-loading">
                <div className="spinner-large"></div>
                <p>Generando reporte...</p>
              </div>
            ) : (
              <>
                {activeTab === 'proformas' && renderProformasTable()}
                {activeTab === 'ventas' && renderVentasChart()}
                {activeTab === 'productos' && renderProductosTop()}
                {activeTab === 'inventario' && renderInventario()}
                {activeTab === 'rentabilidad' && renderRentabilidad()}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}