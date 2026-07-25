import { Link, Outlet, useLocation } from 'react-router-dom'
import { FileText, Search, Home, Building2 } from 'lucide-react'

function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border-b-4 border-indigo-800 shadow-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Reportes Ciudadanos</h1>
                <p className="text-xs text-blue-200 font-medium">Sistema de Gestión Municipal</p>
              </div>
            </Link>
            <div className="flex gap-2">
              <Link
                to="/"
                className="px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 bg-blue-800/50 text-white hover:bg-blue-800 shadow-md"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Inicio</span>
              </Link>
              <Link
                to="/crear-reporte"
                className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                  location.pathname === '/crear-reporte'
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'bg-blue-800/50 text-white hover:bg-blue-800 shadow-md'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Crear Reporte</span>
              </Link>
              <Link
                to="/mis-reportes"
                className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                  location.pathname === '/mis-reportes'
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'bg-blue-800/50 text-white hover:bg-blue-800 shadow-md'
                }`}
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Mis Reportes</span>
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
