import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../hooks/useAuthStore'
import {
  LayoutDashboard, Package, FileText, Users, Truck,
  Settings, LogOut, Receipt, UserCircle, Layers
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',    section: 'PRINCIPAL' },
  { to: '/proformas',   icon: FileText,         label: 'Proformas',    section: 'COMERCIAL' },
  { to: '/clientes',    icon: UserCircle,        label: 'Clientes',     section: 'COMERCIAL' },
  { to: '/inventario',  icon: Package,           label: 'Inventario',   section: 'OPERACIONES' },
  { to: '/proveedores', icon: Truck,             label: 'Proveedores',  section: 'OPERACIONES' },
  { to: '/facturas',    icon: Receipt,           label: 'Facturas (AI)',section: 'OPERACIONES' },
  { to: '/usuarios',    icon: Users,             label: 'Usuarios',     section: 'ADMINISTRACIÓN', adminOnly: true },
  { to: '/configuracion',icon: Settings,         label: 'Configuración',section: 'ADMINISTRACIÓN', adminOnly: true },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || user?.rol === 'ADMIN')

  // Group by section
  const sections = [...new Set(visibleItems.map(i => i.section))]

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Layers size={22} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <div className="brand-name">Proformax</div>
          <div className="brand-sub">Arte Parquet G&G</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {visibleItems
              .filter(item => item.section === section)
              .map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon size={18} className="nav-icon" />
                  <span>{label}</span>
                </NavLink>
              ))}
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--surface-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem', fontWeight: 700, color: 'white', flexShrink: 0
          }}>
            {user?.nombre?.[0]}{user?.apellido?.[0]}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nombre} {user?.apellido}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {user?.rol}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm w-full"
          onClick={handleLogout}
          id="sidebar-logout-btn"
        >
          <LogOut size={14} />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  )
}
