import { Link, Outlet, useLocation } from 'react-router-dom'
import { FileText, Search } from 'lucide-react'

function Layout() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border-b-4 border-indigo-800 shadow-xl">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Reportes Ciudadanos</h1>
                <p className="text-sm text-blue-100 font-medium">Sistema de Gestión Comunitaria</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to="/"
                className={`px-6 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                  location.pathname === '/' 
                    ? 'bg-white text-blue-700 shadow-lg' 
                    : 'bg-blue-700 text-white hover:bg-blue-800 shadow-md'
                }`}
              >
                <FileText className="w-5 h-5" />
                Crear Reporte
              </Link>
              <Link
                to="/mis-reportes"
                className={`px-6 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                  location.pathname === '/mis-reportes' 
                    ? 'bg-white text-blue-700 shadow-lg' 
                    : 'bg-blue-700 text-white hover:bg-blue-800 shadow-md'
                }`}
              >
                <Search className="w-5 h-5" />
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
