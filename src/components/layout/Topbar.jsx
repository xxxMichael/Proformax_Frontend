import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/inventario':   'Inventario de Productos',
  '/proformas':    'Gestión de Proformas',
  '/usuarios':     'Administración de Usuarios',
  '/clientes':     'Clientes',
  '/proveedores':  'Proveedores',
  '/configuracion':'Configuración del Sistema',
  '/facturas':     'Facturas — Azure AI',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'Proformax'

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
      </div>
      <div className="topbar-actions">
        <button className="btn btn-ghost btn-icon" id="topbar-notifications-btn" title="Notificaciones">
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}
