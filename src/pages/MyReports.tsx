import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Search, CheckCircle, Clock, MapPin, Calendar, AlertCircle, FileText } from 'lucide-react'

interface Report {
  id: string
  codigo: string
  titulo: string
  categoria: string
  estado: string
  descripcion: string
  fechaCreacion: Date
  ubicacion: string
}

// Códigos de prueba disponibles
const TEST_CODES = ['REP-2847', 'REP-2831', 'REP-2819', 'REP-2805']

// Datos mock para los códigos de prueba
const MOCK_REPORTS: Record<string, Report> = {
  'REP-2847': {
    id: 'REP-2847',
    codigo: 'REP-2847',
    titulo: 'Fuga de agua en avenida principal',
    categoria: 'Servicio de Agua',
    estado: 'En Progreso',
    descripcion: 'Fuga considerable de agua potable que esta inundando la calle y desperdiciando recurso hidrico desde hace 3 dias.',
    fechaCreacion: new Date('2026-07-22T10:30:00'),
    ubicacion: 'Av. Juarez #1234, Col. Centro'
  },
  'REP-2831': {
    id: 'REP-2831',
    codigo: 'REP-2831',
    titulo: 'Alumbrado publico sin funcionar',
    categoria: 'Alumbrado publico',
    estado: 'Pendiente',
    descripcion: 'Cuatro postes de luz en la cuadra no encienden desde hace una semana, lo que genera inseguridad en la zona.',
    fechaCreacion: new Date('2026-07-22T15:45:00'),
    ubicacion: 'Av. Juarez entre Reforma y Constitucion'
  },
  'REP-2819': {
    id: 'REP-2819',
    codigo: 'REP-2819',
    titulo: 'Bache peligroso en cruce',
    categoria: 'Baches y pavimento',
    estado: 'Resuelto',
    descripcion: 'Bache de aproximadamente 1 metro de diametro en el cruce principal que ha causado danos a vehiculos.',
    fechaCreacion: new Date('2026-07-20T09:15:00'),
    ubicacion: 'Cruce Av. Reforma con Calle 5 de Mayo'
  },
  'REP-2805': {
    id: 'REP-2805',
    codigo: 'REP-2805',
    titulo: 'Basura acumulada en terreno baldio',
    categoria: 'Recoleccion de basura',
    estado: 'En Progreso',
    descripcion: 'Acumulacion de basura que esta atrayendo plagas y genera mal olor afectando a los vecinos.',
    fechaCreacion: new Date('2026-07-18T14:00:00'),
    ubicacion: 'Calle Independencia #567, Col. Los Pinos'
  }
}

export default function MyReports() {
  const [searchCode, setSearchCode] = useState('')
  const [report, setReport] = useState<Report | null>(null)
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
      await new Promise(resolve => setTimeout(resolve, 1500))

      const code = searchCode.toUpperCase()
      const foundReport = MOCK_REPORTS[code]

      if (foundReport) {
        setReport(foundReport)
        setError(null)
      } else {
        setError('No encontramos ningun reporte con ese codigo')
        setReport(null)
      }
    } catch {
      setError('Error al buscar el reporte. Intenta de nuevo.')
      setReport(null)
    } finally {
      setSearching(false)
    }
  }

  const handleTestCodeClick = (code: string) => {
    setSearchCode(code)
  }

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock }
      case 'En Progreso':
        return { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle }
      case 'Resuelto':
        return { color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle }
      default:
        return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Clock }
    }
  }

  const getProgressStep = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 1
      case 'En Progreso': return 2
      case 'Resuelto': return 3
      default: return 1
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
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
                  placeholder="Ej: REP-2847"
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
              <p className="text-xs text-gray-400 mt-2">El codigo tiene el formato REP-XXXX</p>
            </form>
          </CardContent>
        </Card>

        {/* Códigos de prueba - solo si no hay resultado ni error */}
        {!report && !error && (
        <Card className="shadow-sm border border-blue-100 overflow-hidden mb-4">
          <CardContent className="p-4 bg-[#EFF6FF]">
            <p className="text-xs font-semibold text-blue-600 mb-2">Codigos de prueba disponibles:</p>
            <div className="flex flex-wrap gap-2">
              {TEST_CODES.map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleTestCodeClick(code)}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-blue-200 rounded-lg text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  {code}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Error - Reporte no encontrado */}
        {error && (
          <Card className="shadow-sm border border-blue-100 overflow-hidden">
            <CardContent className="p-8 bg-[#EFF6FF] text-center">
              <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Reporte no encontrado</h3>
              <p className="text-xs text-gray-500 mb-3">
                No encontramos ningun reporte con el codigo <strong>{searchedCode}</strong>. Verifica que el codigo sea correcto.
              </p>
              <p className="text-xs text-gray-400">
                Necesitas ayuda? Llama al <a href="tel:072" className="text-blue-600 font-semibold hover:underline">072</a>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resultado encontrado */}
        {report && (
          <Card className="shadow-sm border border-blue-100 overflow-hidden">
            <CardContent className="p-0 bg-white">
              {/* Header del resultado */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Codigo de seguimiento</p>
                    <p className="text-base font-bold text-blue-700">{report.codigo}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusConfig(report.estado).color}`}>
                    {(() => { const Icon = getStatusConfig(report.estado).icon; return <Icon className="w-3 h-3" /> })()}
                    {report.estado}
                  </div>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="px-5 py-4 space-y-4">
                {/* Título */}
                <h3 className="text-base font-bold text-gray-900">{report.titulo}</h3>

                {/* Categoría chip */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                  <FileText className="w-3 h-3" />
                  {report.categoria}
                </span>

                {/* Fecha y Ubicación */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Fecha de reporte</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(report.fechaCreacion)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Ubicacion</p>
                    <div className="flex items-start gap-1.5 text-xs text-gray-700">
                      <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      {report.ubicacion}
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Descripcion</p>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-600 leading-relaxed">{report.descripcion}</p>
                  </div>
                </div>

                {/* Progress tracker */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Progreso</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        getProgressStep(report.estado) >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs mt-1 font-medium ${
                        getProgressStep(report.estado) >= 1 ? 'text-blue-600' : 'text-gray-400'
                      }`}>Pendiente</span>
                    </div>
                    <div className={`flex-1 h-0.5 mx-2 ${
                      getProgressStep(report.estado) >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        getProgressStep(report.estado) >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs mt-1 font-medium ${
                        getProgressStep(report.estado) >= 2 ? 'text-blue-600' : 'text-gray-400'
                      }`}>En proceso</span>
                    </div>
                    <div className={`flex-1 h-0.5 mx-2 ${
                      getProgressStep(report.estado) >= 3 ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        getProgressStep(report.estado) >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs mt-1 font-medium ${
                        getProgressStep(report.estado) >= 3 ? 'text-blue-600' : 'text-gray-400'
                      }`}>Resuelto</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
