import { Link } from "react-router-dom";
import { FileText, Search, Droplets, Zap, Building2, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border-b-4 border-indigo-800">
        <div className="container mx-auto px-6 py-16 md:py-24 text-center">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Reportes Ciudadanos
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-medium max-w-2xl mx-auto mb-3">
            Sistema de Gestión Municipal
          </p>
          <p className="text-base text-blue-200 max-w-xl mx-auto">
            Reporta problemas de agua, electricidad o servicios municipales
            y deja que el departamento correspondiente se encargue.
          </p>
        </div>
      </div>

      {/* Acciones principales */}
      <div className="container mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Crear Reporte */}
          <Link
            to="/crear-reporte"
            className="group bg-white rounded-2xl p-8 border-2 border-blue-100 shadow-xl hover:shadow-2xl hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-5">
              <div className="p-4">
                <FileText className="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition-colors" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  Crear Reporte
                </h2>
                <p className="text-gray-600 font-medium mb-4">
                  Reporta un problema en tu comunidad. Selecciona el tipo de servicio,
                  describe el problema y adjunta evidencia.
                </p>
                <span className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Comenzar <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>

          {/* Consultar Reporte */}
          <Link
            to="/mis-reportes"
            className="group bg-white rounded-2xl p-8 border-2 border-blue-100 shadow-xl hover:shadow-2xl hover:border-green-300 transition-all"
          >
            <div className="flex items-start gap-5">
              <div className="p-4">
                <Search className="w-10 h-10 text-green-600 group-hover:text-green-700 transition-colors" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                  Consultar Reporte
                </h2>
                <p className="text-gray-600 font-medium mb-4">
                  Ingresa tu código de seguimiento para ver el estado actual
                  de tu reporte y saber si ya fue atendido.
                </p>
                <span className="inline-flex items-center gap-2 text-green-600 font-bold text-sm group-hover:gap-3 transition-all">
                  Consultar <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Áreas de servicio */}
      <div className="container mx-auto px-6 py-16">
        <h3 className="text-center text-xl font-bold text-gray-800 mb-8">
          Departamentos que atienden tus reportes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border-2 border-blue-100 shadow-lg text-center">
            <Droplets className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
            <h4 className="font-bold text-gray-800 mb-1">Servicio de Agua</h4>
            <p className="text-sm text-gray-500">Fugas, falta de agua, drenaje, alcantarillado</p>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-yellow-100 shadow-lg text-center">
            <Zap className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
            <h4 className="font-bold text-gray-800 mb-1">Servicio Eléctrico</h4>
            <p className="text-sm text-gray-500">Alumbrado público, postes, cables caídos</p>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-green-100 shadow-lg text-center">
            <Building2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h4 className="font-bold text-gray-800 mb-1">Servicios Municipales</h4>
            <p className="text-sm text-gray-500">Baches, basura, áreas verdes, señalización</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t-2 border-gray-200 py-6">
        <p className="text-center text-sm text-gray-500 font-medium">
          Sistema de Reportes Ciudadanos — Gobierno Municipal
        </p>
      </div>
    </div>
  );
}
