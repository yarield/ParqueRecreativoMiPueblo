import { NavLink } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { LAYOUT_LABELS } from '@/constants/layout.constants'

const navItems = [
  { to: '/clientes', label: LAYOUT_LABELS.nav.clientes },
  { to: '/paquetes', label: LAYOUT_LABELS.nav.paquetes },
  { to: '/facturas', label: LAYOUT_LABELS.nav.facturas },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r bg-white h-screen flex flex-col">
      <div className="px-4 py-5">
        <h1 className="text-sm font-semibold leading-tight text-gray-800">
          {LAYOUT_LABELS.appName}
        </h1>
      </div>
      <Separator />
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
