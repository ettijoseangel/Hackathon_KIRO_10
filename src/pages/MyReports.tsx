import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, CheckCircle, Clock, AlertCircle, XCircle, Eye } from 'lucide-react'

interface Report {
  id: string
  codigo: string
  titulo: string
  categoria: string
  estado: string
  fechaCreacion: Date
  ubicacion: string
}

export default function MyReports() {
  const [searchCode, setSearchCode] = useState('')
  const [report, setReport] = useState<Report | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchCode.trim()) {
      setError('Por favor ingresa un código de seguimiento')
      return
    }

    setSearching(true)
    setError(null)
    
    try {
      // Simular búsqueda (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // TODO: Aquí se implementará la petición HTTP GET al backend
      // Por ahora simulamos un reporte
      if (searchCode.toUpperCase() === 'REP-001' || searchCode.toUpperCase() === 'REP-002') {
        setReport({
          id: searchCode.toUpperCase(),
          codigo: searchCode.toUpperCase(),
          titulo: 'Bache en calle principal',
          categoria: 'Infraestructura Vial',
          estado: 'En Progreso',
          fechaCreacion: new Date(),
          ubicacion: 'Calle Principal #123, Colonia Centro'
        })
      } else {
        setError('No se encontró ningún reporte con ese código')
        setReport(null)
      }
    } catch (err) {
      setError('Error al buscar el reporte. Por favor, intenta de nuevo.')
      setReport(null)
    } finally {
      setSearching(false)
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return <Clock className="w-5 h-5" />
      case 'En Revisión':
        return <Eye className="w-5 h-5" />
      case 'En Progreso':
        return <AlertCircle className="w-5 h-5" />
      case 'Resuelto':
        return <CheckCircle className="w-5 h-5" />
      case 'Rechazado':
        return <XCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'En Revisión':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'En Progreso':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Resuelto':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Rechazado':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-10 text-white shadow-2xl border-4 border-indigo-800">
          <h1 className="text-4xl font-bold mb-3">Mis Reportes</h1>
          <p className="text-lg text-blue-100 font-medium">
            Consulta el estado de tus reportes ciudadanos ingresando tu código de seguimiento
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <Card className="shadow-xl border-2 border-blue-100 mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
            <CardTitle className="text-xl font-bold text-gray-800">Buscar Reporte</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Ingresa el código de seguimiento que recibiste al crear tu reporte
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-code" className="text-base font-semibold">
                  Código de Seguimiento
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="search-code"
                    placeholder="Ej: REP-001"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    className="h-12 text-base border-2 border-gray-300 focus:border-blue-500"
                    disabled={searching}
                  />
                  <Button
                    type="submit"
                    disabled={searching}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-lg border-2 border-indigo-800"
                  >
                    {searching ? (
                      <>Buscando...</>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg font-medium">
                  {error}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Resultado */}
        {report && (
          <Card className="shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Reporte Encontrado
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-medium text-base mt-1">
                    Código: <span className="font-bold text-blue-700">{report.codigo}</span>
                  </CardDescription>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(report.estado)}`}>
                  {getStatusIcon(report.estado)}
                  <span className="font-bold">{report.estado}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-bold text-gray-600 uppercase">Título</Label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{report.titulo}</p>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-600 uppercase">Categoría</Label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{report.categoria}</p>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-600 uppercase">Fecha de Creación</Label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {new Intl.DateTimeFormat('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(report.fechaCreacion)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-600 uppercase">Ubicación</Label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{report.ubicacion}</p>
                </div>
              </div>

              {/* Línea de tiempo de estado */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Estado Actual</h3>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${getStatusColor(report.estado)} border-2`}>
                    {getStatusIcon(report.estado)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{report.estado}</p>
                    <p className="text-sm text-gray-600">
                      {report.estado === 'Pendiente' && 'Tu reporte está en espera de revisión'}
                      {report.estado === 'En Revisión' && 'Tu reporte está siendo evaluado por las autoridades'}
                      {report.estado === 'En Progreso' && 'Las autoridades están trabajando en resolver tu reporte'}
                      {report.estado === 'Resuelto' && '¡Tu reporte ha sido resuelto exitosamente!'}
                      {report.estado === 'Rechazado' && 'Tu reporte fue rechazado. Contacta con las autoridades para más información'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información adicional */}
        {!report && !error && (
          <Card className="shadow-lg border-2 border-gray-200 bg-white">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">¿Cómo funciona?</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Cuando creas un reporte, recibes un código único de seguimiento. 
                  Usa ese código aquí para consultar el estado de tu reporte en cualquier momento.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
