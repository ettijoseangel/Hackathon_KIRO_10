import { Link, Outlet, useLocation } from 'react-router-dom'
import { MapPin } from 'lucide-react'

function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <nav className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white">
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">Reporte Cívico</span>
            </Link>

            {/* Links de navegación */}
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
              >
                Inicio
              </Link>
              <Link
                to="/mis-reportes"
                className={`text-sm font-medium transition-colors ${location.pathname === '/mis-reportes' ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
              >
                Mis reportes
              </Link>
              <Link
                to="/mapa"
                className={`text-sm font-medium transition-colors ${location.pathname === '/mapa' ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
              >
                Mapa
              </Link>
              <Link
                to="/ayuda"
                className={`text-sm font-medium transition-colors ${location.pathname === '/ayuda' ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
              >
                Ayuda
              </Link>
              <Link
                to="/crear-reporte"
                className="bg-white text-indigo-700 font-bold text-sm px-5 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Crear reporte
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
