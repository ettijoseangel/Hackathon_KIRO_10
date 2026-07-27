import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Search, CheckCircle, Clock, MapPin, Calendar, AlertCircle, FileText, Phone, Globe, Copy, ArrowRight } from 'lucide-react'
import { buscarPorCodigo, type ReporteConHistorial } from '@/services/reporteService'
import { obtenerGuiaIA, type OrientacionIA } from '@/services/orientacionService'

export default function MyReports() {
  const [searchCode, setSearchCode] = useState('')
  const [report, setReport] = useState<ReporteConHistorial | null>(null)
  const [orientacion, setOrientacion] = useState<OrientacionIA | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchedCode, setSearchedCode] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchCode.trim()) {
      setError('Por favor ingresa un codigo de seguimiento')
      return
    }

    setSearching(true)
    setError(null)
    setSearchedCode(searchCode.toUpperCase())

    try {
      const resultado = await buscarPorCodigo(searchCode.trim().toUpperCase())

      if (resultado.error) {
        setError(resultado.error.httpStatus === 404
          ? 'No encontramos ningun reporte con ese codigo'
          : resultado.error.error
        )
        setReport(null)
        setOrientacion(null)
        return
      }

      if (resultado.data) {
        setReport(resultado.data)
        setError(null)

        // Intentar obtener orientacion IA
        const guia = await obtenerGuiaIA(resultado.data.id)
        if (guia.data) {
          setOrientacion(guia.data)
        } else {
          setOrientacion(null)
        }
      }
    } catch {
      setError('Error al buscar el reporte. Intenta de nuevo.')
      setReport(null)
      setOrientacion(null)
    } finally {
      setSearching(false)
    }
  }

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, label: 'Pendiente' }
      case 'EN_PROCESO':
        return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle, label: 'En Proceso' }
      case 'RESUELTO':
        return { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle, label: 'Resuelto' }
      case 'CANCELADO':
        return { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle, label: 'Cancelado' }
      default:
        return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Clock, label: estado }
    }
  }

  const getProgressStep = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 1
      case 'EN_PROCESO': return 2
      case 'RESUELTO': return 3
      case 'CANCELADO': return 0
      default: return 1
    }
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateStr))
  }

  const getLocationText = (r: ReporteConHistorial) => {
    if (r.direccion) return r.direccion
    if (r.latitud && r.longitud) return `Lat: ${r.latitud}, Lng: ${r.longitud}`
    return 'No especificada'
  }

  const copyScript = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Script copiado al portapapeles')
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-10 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Consultar Reporte</h1>
          <p className="text-sm text-gray-500">
            Ingresa tu codigo de seguimiento para ver el estado de tu reporte.
          </p>
        </div>

        {/* Tarjeta de búsqueda */}
        <Card className="shadow-sm border border-blue-100 overflow-hidden mb-4">
          <CardHeader className="bg-[#EFF6FF] border-b border-blue-100 py-3 px-5">
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-800">Codigo de seguimiento</h2>
            </div>
          </CardHeader>
          <CardContent className="p-5 bg-white">
            <form onSubmit={handleSearch}>
              <div className="flex gap-3">
                <Input
                  placeholder="Ej: REP-001"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="h-10 text-sm border-gray-200 flex-1"
                  disabled={searching}
                />
                <Button
                  type="submit"
                  disabled={searching}
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm"
                >
                  <Search className="w-4 h-4 mr-1.5" />
                  {searching ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">El codigo tiene el formato REP-XXX</p>
            </form>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="shadow-sm border border-blue-100 overflow-hidden mb-4">
            <CardContent className="p-8 bg-[#EFF6FF] text-center">
              <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Reporte no encontrado</h3>
              <p className="text-xs text-gray-500">
                No encontramos ningun reporte con el codigo <strong>{searchedCode}</strong>. Verifica que sea correcto.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resultado encontrado */}
        {report && (
          <div className="space-y-4">
            {/* Ficha del reporte */}
            <Card className="shadow-sm border border-blue-100 overflow-hidden">
              <CardContent className="p-0 bg-white">
                {/* Header del resultado */}
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Codigo de seguimiento</p>
                      <p className="text-base font-bold text-blue-700">{report.codigoSeguimiento}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusConfig(report.estado).color}`}>
                      {(() => { const Icon = getStatusConfig(report.estado).icon; return <Icon className="w-3 h-3" /> })()}
                      {getStatusConfig(report.estado).label}
                    </div>
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="px-5 py-4 space-y-4">
                  <h3 className="text-base font-bold text-gray-900">{report.titulo}</h3>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                    <FileText className="w-3 h-3" />
                    {report.areaServicio} - {report.categoria}
                  </span>

                  {/* Fecha y Ubicación */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Fecha de reporte</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDate(report.createdAt)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Ubicacion</p>
                      <div className="flex items-start gap-1.5 text-xs text-gray-700">
                        <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        {getLocationText(report)}
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  {report.descripcion && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Descripcion</p>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-600 leading-relaxed">{report.descripcion}</p>
                      </div>
                    </div>
                  )}

                  {/* Progress tracker */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Progreso del reporte</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getProgressStep(report.estado) >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs mt-1 font-medium ${getProgressStep(report.estado) >= 1 ? 'text-blue-600' : 'text-gray-400'
                          }`}>Pendiente</span>
                      </div>
                      <div className={`flex-1 h-0.5 mx-2 ${getProgressStep(report.estado) >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getProgressStep(report.estado) >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs mt-1 font-medium ${getProgressStep(report.estado) >= 2 ? 'text-blue-600' : 'text-gray-400'
                          }`}>En proceso</span>
                      </div>
                      <div className={`flex-1 h-0.5 mx-2 ${getProgressStep(report.estado) >= 3 ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getProgressStep(report.estado) >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs mt-1 font-medium ${getProgressStep(report.estado) >= 3 ? 'text-green-600' : 'text-gray-400'
                          }`}>Resuelto</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orientación IA */}
            {orientacion && (
              <Card className="shadow-sm border border-indigo-200 overflow-hidden">
                <CardContent className="p-0">
                  {/* Header de orientación */}
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-700 px-5 py-4 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">Orientacion Institucional</p>
                    <h3 className="text-base font-bold">
                      {orientacion.institucion.nombre
                        ? `Tu reporte esta listo para ser canalizado a ${orientacion.institucion.nombre}`
                        : 'Orientacion para tu reporte'
                      }
                    </h3>
                    {orientacion.institucion.descripcion && (
                      <p className="text-xs text-blue-100 mt-1">{orientacion.institucion.descripcion}</p>
                    )}
                  </div>

                  {/* Medios de contacto */}
                  {(orientacion.medios_contacto.length > 0 || orientacion.institucion.sitio_web) && (
                    <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-2">
                      {orientacion.medios_contacto.map((medio, i) => (
                        <a
                          key={i}
                          href={medio.tipo === 'telefono' ? `tel:${medio.valor}` : medio.valor}
                          target={medio.tipo !== 'telefono' ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          {medio.tipo === 'telefono' ? <Phone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                          {medio.tipo === 'telefono' ? `Llamar: ${medio.valor}` : medio.valor}
                        </a>
                      ))}
                      {orientacion.institucion.sitio_web && (
                        <a
                          href={orientacion.institucion.sitio_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <Globe className="w-3 h-3" />
                          {orientacion.institucion.sitio_web}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Script sugerido */}
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-700">Guion sugerido para el operador</p>
                      <button
                        onClick={() => copyScript(
                          `Quiero reportar ${report.titulo}. ${report.descripcion || ''} Mi folio ciudadano es ${report.codigoSeguimiento}. La ubicacion es ${getLocationText(report)}. ¿Pueden ayudarme a darle seguimiento?`
                        )}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar
                      </button>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs text-gray-700 leading-relaxed">
                      "Quiero reportar {report.titulo}. {report.descripcion ? `${report.descripcion} ` : ''}Mi folio ciudadano es {report.codigoSeguimiento}. La ubicacion es {getLocationText(report)}. ¿Pueden ayudarme a darle seguimiento?"
                    </div>
                  </div>

                  {/* Próximos pasos */}
                  {orientacion.pasos_siguientes.length > 0 && (
                    <div className="px-5 py-4">
                      <p className="text-xs font-bold text-gray-700 mb-3">Proximos pasos</p>
                      <div className="space-y-2.5">
                        {orientacion.pasos_siguientes.map((paso) => (
                          <div key={paso.orden} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {paso.orden}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{paso.titulo}</p>
                              <p className="text-xs text-gray-500">{paso.descripcion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback si la IA no pudo identificar */}
                  {orientacion.requiere_mas_informacion && orientacion.pregunta_aclaratoria && (
                    <div className="px-5 py-4 bg-amber-50 border-t border-amber-200">
                      <p className="text-xs text-amber-800">
                        <strong>Nota:</strong> {orientacion.pregunta_aclaratoria}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Fallback cuando no hay orientacion IA */}
            {!orientacion && report && (
              <Card className="shadow-sm border border-gray-200 overflow-hidden">
                <CardContent className="p-5 bg-gray-50 text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    La orientacion institucional no esta disponible para este reporte.
                  </p>
                  <p className="text-xs text-gray-400">
                    Te recomendamos llamar al <a href="tel:072" className="text-blue-600 font-semibold hover:underline">072</a> (atencion ciudadana) y proporcionar tu folio.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Estado vacío */}
        {!report && !error && (
          <Card className="shadow-sm border border-gray-200 overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Ingresa tu folio</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Cuando creas un reporte recibes un codigo unico. Usalo aqui para consultar el estado y la orientacion institucional.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
