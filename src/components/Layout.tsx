import { Link, Outlet, useLocation } from 'react-router-dom'
import { FileText, Search, Home, Shield, Plus } from 'lucide-react'

function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <nav className="bg-white border-b-3 border-[#DBEAFE] ">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-base font-bold text-gray-900">Reportes Ciudadanos</span>
            </Link>

            {/* Links de navegación */}
            <div className="flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  location.pathname === '/'
                    ? 'text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                Inicio
              </Link>
              <Link
                to="/crear-reporte"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  location.pathname === '/crear-reporte'
                    ? 'border border-blue-600 text-blue-700 bg-blue-50'
                    : 'border border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Plus className="w-4 h-4" />
                Crear Reporte
              </Link>
              <Link
                to="/mis-reportes"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  location.pathname === '/mis-reportes'
                    ? 'text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Mis Reportes
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
