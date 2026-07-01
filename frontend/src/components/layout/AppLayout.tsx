import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { LAYOUT_LABELS } from '@/constants/layout.constants'

export default function AppLayout() {
  const { usuario, logout } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-3 flex items-center justify-end gap-4">
          <span className="text-sm text-gray-600">
            {LAYOUT_LABELS.hola}, {usuario?.nombre}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            {LAYOUT_LABELS.cerrarSesion}
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
