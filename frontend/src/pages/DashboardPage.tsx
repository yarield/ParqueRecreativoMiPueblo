import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { usuario, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Parque Recreativo Mi Pueblo</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hola, {usuario?.nombre}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main className="p-6">
        <p className="text-gray-500">Dashboard en construcción...</p>
      </main>
    </div>
  )
}
