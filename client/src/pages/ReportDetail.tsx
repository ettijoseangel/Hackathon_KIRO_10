import { useLocation, Link, Navigate } from 'react-router-dom'
import { FileText, MapPin, Sparkles, CheckCircle2, Phone, Globe, Mail, Building2, Copy, ArrowLeft } from 'lucide-react'
import type { Reporte, OrientacionIAResponse } from '@/services/reporteService'

// Iconos para tipo de medio de contacto
const MEDIO_ICONS: Record<string, typeof Phone> = {
  telefono: Phone,
  web: Globe,
  email: Mail,
  direccion_fisica: Building2,
  red_social: Globe,
  app_movil: Globe,
}

// Colores para prioridad
const PRIORIDAD_COLORS: Record<string, string> = {
  BAJA: 'text-green-700 bg-green-100 border-green-200',
  MEDIA: 'text-amber-700 bg-amber-100 border-amber-200',
  ALTA: 'text-orange-700 bg-orange-100 border-orange-200',
  URGENTE: 'text-red-700 bg-red-100 border-red-200',
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ReportDetail() {
  const location = useLocation()
  const state = location.state as { reporte: Reporte; orientacionIA: OrientacionIAResponse | null } | null

  // Si no hay datos (acceso directo sin pasar por el form), redirigir
  if (!state?.reporte) {
    return <Navigate to="/crear-reporte" replace />
  }

  const { reporte, orientacionIA } = state
  const confianzaPct = orientacionIA?.confianza ? Math.round(orientacionIA.confianza * 100) : 0

  const handleCopyCodigo = () => {
    navigator.clipboard.writeText(reporte.codigoSeguimiento)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <Link to="/crear-reporte" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Crear otro reporte
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Detalle del Reporte</h1>
          <p className="text-gray-500 mt-1">
            Codigo de seguimiento: <span className="font-bold text-indigo-600">{reporte.codigoSeguimiento}</span>
            <button onClick={handleCopyCodigo} className="ml-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors">
              <Copy className="w-3 h-3" /> Copiar
            </button>
          </p>
        </div>

        {/* Seccion 1: Informacion del reporte */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">1. Informacion del reporte</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Titulo del problema</p>
              <p className="text-lg font-semibold text-gray-900">{reporte.titulo}</p>
            </div>

            {reporte.descripcion && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Descripcion</p>
                <p className="text-sm text-gray-700">{reporte.descripcion}</p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Area</p>
                <span className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  {reporte.areaServicio}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Categoria</p>
                <span className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                  {reporte.categoria}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Prioridad</p>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${PRIORIDAD_COLORS[reporte.prioridad] || 'text-gray-700 bg-gray-100'}`}>
                  {reporte.prioridad}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Estado</p>
                <span className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                  {reporte.estado}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Codigo</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{reporte.codigoSeguimiento}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Registrado</p>
                <p className="text-sm text-gray-700 mt-1">{formatDate(reporte.createdAt)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Seccion 2: Ubicacion */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">2. Ubicacion</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {reporte.colonia && (
                <div className="flex justify-between col-span-2 border-b border-gray-100 pb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase">Colonia</p>
                  <p className="text-sm font-medium text-gray-900">{reporte.colonia}</p>
                </div>
              )}
              <div className="flex justify-between col-span-2 border-b border-gray-100 pb-3">
                <p className="text-xs font-bold text-gray-400 uppercase">Municipio</p>
                <p className="text-sm font-medium text-gray-900">{reporte.municipio}</p>
              </div>
              <div className="flex justify-between col-span-2 border-b border-gray-100 pb-3">
                <p className="text-xs font-bold text-gray-400 uppercase">Tipo</p>
                <p className="text-sm font-medium text-gray-900">{reporte.tipoUbicacion}</p>
              </div>
              {reporte.latitud && reporte.longitud && (
                <div className="flex justify-between col-span-2 pb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase">Coordenadas</p>
                  <p className="text-sm font-medium text-gray-900">{reporte.latitud}, {reporte.longitud}</p>
                </div>
              )}
            </div>

            {/* Mapa placeholder */}
            {reporte.latitud && reporte.longitud && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-100 h-32 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-4 h-4 bg-indigo-600 rounded-full mx-auto mb-1 border-2 border-white shadow"></div>
                  <p className="text-xs font-bold text-indigo-600 uppercase">
                    {reporte.colonia ? `${reporte.colonia}, ` : ''}{reporte.municipio}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Seccion 3: Orientacion de IA */}
        {orientacionIA && (
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">3. Orientacion de IA</h2>
                {orientacionIA.modeloIA && (
                  <p className="text-xs text-gray-400">Modelo: {orientacionIA.modeloIA}</p>
                )}
              </div>
            </div>
            <div className="p-6 space-y-6">

              {/* Institucion recomendada */}
              {orientacionIA.institucionNombre && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Institucion recomendada</p>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-base font-bold text-gray-900">{orientacionIA.institucionNombre}</p>
                    {orientacionIA.institucionDescripcion && (
                      <p className="text-sm text-gray-500 mt-1">{orientacionIA.institucionDescripcion}</p>
                    )}
                    {orientacionIA.institucionSitioWeb && (
                      <a href={orientacionIA.institucionSitioWeb} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                        {orientacionIA.institucionSitioWeb}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Barra de confianza */}
              {orientacionIA.confianza != null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Confianza</p>
                    <span className="text-sm font-bold text-green-600">{confianzaPct}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${confianzaPct}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Medios de contacto */}
              {orientacionIA.mediosContacto && orientacionIA.mediosContacto.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Medios de contacto</p>
                  <div className="space-y-2">
                    {orientacionIA.mediosContacto.map((medio, i) => {
                      const Icon = MEDIO_ICONS[medio.tipo] || Globe
                      return (
                        <div key={i} className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                          <Icon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{medio.valor}</p>
                            {medio.horario_atencion && (
                              <p className="text-xs text-gray-400">{medio.horario_atencion}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Requiere mas informacion */}
              {orientacionIA.requiereMasInformacion && orientacionIA.mensajeFallback && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800 font-medium">{orientacionIA.mensajeFallback}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Seccion 4: Proximos pasos */}
        {orientacionIA?.proximosPasos && orientacionIA.proximosPasos.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">4. Proximos pasos</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {orientacionIA.proximosPasos.map((paso) => (
                  <div key={paso.orden} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">{paso.orden}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{paso.titulo}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{paso.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 mt-8 mb-4">
          La orientacion fue generada por IA · Verifica siempre la informacion con la institucion oficial
        </p>

        {/* Acciones finales */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link to="/mis-reportes"
            className="flex-1 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all text-sm">
            Consultar mis reportes
          </Link>
          <Link to="/"
            className="flex-1 h-12 flex items-center justify-center border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ReportDetail
