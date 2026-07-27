import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, WavesHorizontal, UtilityPole, Building2, Phone, BarChart3, Shield } from "lucide-react";
import { listarReportes, type Reporte } from "@/services/reporteService";

export default function Landing() {
  const [totalReportes, setTotalReportes] = useState<number>(0)
  const [reportesRecientes, setReportesRecientes] = useState<Reporte[]>([])

  useEffect(() => {
    async function cargarEstadisticas() {
      const resultado = await listarReportes()
      if (resultado.data) {
        setTotalReportes(resultado.data.total)
        setReportesRecientes(resultado.data.reportes.slice(0, 5))
      }
    }
    cargarEstadisticas()
  }, [])
  return (
    <div className="min-h-screen bg-[#F1F5F9] relative">
      {/* Hero Section */}
      <section className="bg-[#1D4ED8] text-white ">
        <div className="container mx-auto px-6 py-14 md:py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2  border-2 border-[#2563EB] rounded-full px-5 py-2 mb-8">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Gobierno Municipal &middot; Servicio Ciudadano</span>
          </div>


          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            <span className="block text-white">Reporta Problemas de</span>
            <span className="block  font-ligh text-blue-200">Servicios Públicos</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-blue-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Sin necesidad de registro. Reporta y da seguimiento a problemas en tu
            comunidad de forma rapida y sencilla.
          </p>

          {/* Botones CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/crear-reporte"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-blue-50 transition-all text-base"
            >
              <Plus className="w-5 h-5" />
              Crear Reporte
            </Link>
            <Link
              to="/mis-reportes"
              className="inline-flex items-center gap-2 bg-[#193CB8] border-2 border-[#2563EB] text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-[#142f94] transition-all text-base"
            >
              <Search className="w-5 h-5" />
              Consultar Reporte
            </Link>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto text-center">
            <div>
              <p className="text-xl md:text-2xl font-bold text-[#1D4ED8]">{totalReportes.toLocaleString()}</p>
              <p className="text-[#76748E] text-xs font-medium mt-1.5">Reportes recibidos</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-[#1D4ED8]">
                {reportesRecientes.length > 0
                  ? `${Math.round((reportesRecientes.filter(r => r.estado === 'RESUELTO').length / reportesRecientes.length) * 100)}%`
                  : '0%'
                }
              </p>
              <p className="text-[#76748E] text-xs font-medium mt-1.5">Resueltos</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-[#1D4ED8]">
                {reportesRecientes.filter(r => r.estado === 'PENDIENTE' || r.estado === 'EN_PROCESO').length}
              </p>
              <p className="text-[#76748E] text-xs font-medium mt-1.5">Activos ahora</p>
            </div>
          </div>
        </div>
      </section>

      {/* Áreas de Servicio */}
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Áreas de Servicio</h2>
          <p className="text-gray-500 text-lg">Selecciona el area correspondiente a tu problema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Tarjeta Agua */}
          <div className="bg-white rounded-2xl border-2 border-blue-100 p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12  flex items-center justify-center ">
                <WavesHorizontal className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Agua</h3>
                <p className="text-sm text-gray-500">Servicios hidraulicos</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                Fugas de agua
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                Presion baja
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                Cortes de suministro
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                Drenaje obstruido
              </li>
            </ul>
          </div>

          {/* Tarjeta Eléctrico */}
          <div className="bg-white rounded-2xl border-2 border-yellow-100 p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12  flex items-center justify-center ">
                <UtilityPole className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Electrico</h3>
                <p className="text-sm text-gray-500">Servicios electricos</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></span>
                Fallas electricas
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></span>
                Postes caidos
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></span>
                Alumbrado publico
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></span>
                Cables peligrosos
              </li>
            </ul>
          </div>

          {/* Tarjeta Municipales */}
          <div className="bg-white rounded-2xl border-2 border-green-100 p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12  flex items-center justify-center ">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Municipales</h3>
                <p className="text-sm text-gray-500">Servicios generales</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                Baches y pavimento
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                Recoleccion de basura
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                Parques danados
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                Senalizacion
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Reportes Recientes */}
      {reportesRecientes.length > 0 && (
        <section className="container mx-auto px-6 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Ultimos reportes ciudadanos</h3>
              <Link to="/mis-reportes" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Ver todos →
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Folio</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Area</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Titulo</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reportesRecientes.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-sm font-semibold text-blue-600">{r.codigoSeguimiento}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">{r.areaServicio}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 truncate max-w-[200px]">{r.titulo}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${r.estado === 'RESUELTO' ? 'bg-green-50 text-green-700' :
                            r.estado === 'EN_PROCESO' ? 'bg-blue-50 text-blue-700' :
                              r.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-700' :
                                'bg-gray-50 text-gray-700'
                          }`}>
                          {r.estado === 'EN_PROCESO' ? 'En proceso' : r.estado === 'PENDIENTE' ? 'Pendiente' : r.estado === 'RESUELTO' ? 'Resuelto' : r.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Emergencia urgente */}
      <section className="container mx-auto px-6 pb-16">
        <div className="bg-gray-100 rounded-2xl p-10 md:p-14 text-center max-w-4xl mx-auto border border-gray-200">
          <Phone className="w-10 h-10 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Emergencia urgente?</h3>
          <p className="text-gray-500 mb-6">
            Para emergencias inmediatas llama a nuestro centro de atencion
          </p>
          <a
            href="tel:072"
            className="inline-flex items-center gap-2.5 border-2 border-[#193CB8] bg-[#193CB8] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-colors text-base shadow-lg"
          >
            <Phone className="w-5 h-5" />
            072 &middot; Atencion Ciudadana
          </a>
        </div>
      </section>



      {/* Botón Admin flotante */}
      <Link
        to="/dashboard"
        className="fixed bottom-6 right-6 inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:border-gray-300 transition-all"
      >
        <BarChart3 className="w-4 h-4" />
        Admin
      </Link>
    </div>
  );
}
