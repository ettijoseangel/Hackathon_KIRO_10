import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { listarReportes, type Reporte } from '@/services/reporteService'
import { MapPin, Filter, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Iconos personalizados por área de servicio
const createIcon = (color: string) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
})

const AREA_ICONS: Record<string, L.DivIcon> = {
  AGUA: createIcon('#2563EB'),
  DRENAJE: createIcon('#2563EB'),
  ALUMBRADO: createIcon('#D97706'),
  BACHEO: createIcon('#DC2626'),
  RECOLECCION_BASURA: createIcon('#DC2626'),
  OTRO: createIcon('#6B7280'),
}

const AREA_COLORS: Record<string, string> = {
  AGUA: 'bg-blue-500',
  DRENAJE: 'bg-blue-500',
  ALUMBRADO: 'bg-yellow-500',
  BACHEO: 'bg-red-500',
  RECOLECCION_BASURA: 'bg-red-500',
  OTRO: 'bg-gray-500',
}

const AREA_LABELS: Record<string, string> = {
  AGUA: 'Agua',
  DRENAJE: 'Drenaje',
  ALUMBRADO: 'Electricidad',
  BACHEO: 'Bacheo',
  RECOLECCION_BASURA: 'Basura',
  OTRO: 'Otro',
}

const ESTADO_FILTERS = ['Todos', 'PENDIENTE', 'EN_PROCESO', 'RESUELTO']

export default function MapaIncidencias() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [filtroArea, setFiltroArea] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarReportes() {
      setLoading(true)
      const resultado = await listarReportes()
      if (resultado.data) {
        // Solo reportes con coordenadas GPS
        setReportes(resultado.data.reportes.filter(r => r.latitud && r.longitud))
      }
      setLoading(false)
    }
    cargarReportes()
  }, [])

  // Aplicar filtros
  const reportesFiltrados = reportes.filter(r => {
    if (filtroArea && r.areaServicio !== filtroArea) return false
    if (filtroEstado !== 'Todos' && r.estado !== filtroEstado) return false
    return true
  })

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente'
      case 'EN_PROCESO': return 'En Proceso'
      case 'RESUELTO': return 'Resuelto'
      case 'CANCELADO': return 'Cancelado'
      default: return estado
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return <Clock className="w-3 h-3" />
      case 'EN_PROCESO': return <AlertCircle className="w-3 h-3" />
      case 'RESUELTO': return <CheckCircle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  // Areas únicas para el filtro
  const areasDisponibles = [...new Set(reportes.map(r => r.areaServicio))]

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mapa de Incidencias</h1>
            <p className="text-xs text-gray-500">Reportes activos con ubicacion GPS</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700">
              <MapPin className="w-3 h-3" />
              {reportesFiltrados.length} activos
            </span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex">
        {/* Panel lateral de filtros */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 space-y-5 overflow-y-auto">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Filter className="w-4 h-4" />
            Filtros
          </div>

          {/* Filtro por área */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Area de servicio</p>
            <div className="space-y-1.5">
              <button
                onClick={() => setFiltroArea(null)}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                  filtroArea === null ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Todas ({reportes.length})
              </button>
              {areasDisponibles.map(area => (
                <button
                  key={area}
                  onClick={() => setFiltroArea(area)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center gap-2 ${
                    filtroArea === area ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${AREA_COLORS[area] || 'bg-gray-400'}`}></span>
                  {AREA_LABELS[area] || area} ({reportes.filter(r => r.areaServicio === area).length})
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Estado</p>
            <div className="flex flex-wrap gap-1.5">
              {ESTADO_FILTERS.map(estado => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                    filtroEstado === estado ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {estado === 'Todos' ? 'Todos' : getStatusLabel(estado)}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de reportes en sidebar */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reportes ({reportesFiltrados.length})</p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {reportesFiltrados.map(r => (
                <div key={r.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-blue-600">{r.codigoSeguimiento}</span>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                      r.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-700' :
                      r.estado === 'EN_PROCESO' ? 'bg-blue-50 text-blue-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      {getStatusIcon(r.estado)}
                      {getStatusLabel(r.estado)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 truncate">{r.titulo}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{AREA_LABELS[r.areaServicio] || r.areaServicio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leyenda */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Leyenda</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> Agua / Drenaje
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Electricidad
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full bg-red-500"></span> Municipal
              </div>
            </div>
          </div>
        </aside>

        {/* Mapa */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500">Cargando mapa...</p>
            </div>
          ) : (
            <MapContainer
              center={[25.6866, -100.3161]}
              zoom={12}
              className="h-full w-full"
              style={{ minHeight: 'calc(100vh - 73px)' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {reportesFiltrados.map(r => (
                <Marker
                  key={r.id}
                  position={[parseFloat(r.latitud!), parseFloat(r.longitud!)]}
                  icon={AREA_ICONS[r.areaServicio] || AREA_ICONS.OTRO}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-blue-600">{r.codigoSeguimiento}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          r.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                          r.estado === 'EN_PROCESO' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>{getStatusLabel(r.estado)}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{r.titulo}</p>
                      <p className="text-xs text-gray-500">{AREA_LABELS[r.areaServicio] || r.areaServicio}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  )
}
