import { useState, useRef, useCallback } from "react"
import type { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Location } from "@/types/report"
import { Navigation, Loader2, FileText, Upload, Check, ChevronDown, Droplets, Zap, Building2, Info } from "lucide-react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { crearReporte } from "@/services/reporteService"
import { useNavigate } from "react-router-dom"

// Pin personalizado para el mapa
const mapPin = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background:#6366F1;width:28px;height:28px;border-radius:50%;border:4px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

// Categorías con acordeón por área
const AREA_CATEGORIES = [
  {
    key: 'agua',
    label: 'Agua y Drenaje',
    icon: Droplets,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    items: [
      { value: 'agua-fuga', label: 'Fuga de agua' },
      { value: 'agua-corte', label: 'Falta de agua' },
      { value: 'agua-drenaje', label: 'Drenaje tapado' },
    ],
  },
  {
    key: 'electrico',
    label: 'Electricidad',
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    items: [
      { value: 'electrico-falla', label: 'Falla electrica' },
      { value: 'electrico-poste', label: 'Poste sin luz' },
      { value: 'electrico-cables', label: 'Cable caido' },
    ],
  },
  {
    key: 'municipal',
    label: 'Servicios Municipales',
    icon: Building2,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    items: [
      { value: 'municipal-bache', label: 'Bache / pavimento' },
      { value: 'municipal-basura', label: 'Recoleccion de basura' },
      { value: 'municipal-parque', label: 'Parque danado' },
    ],
  },
]

// Mapeo categorias frontend → enums backend
const CATEGORY_TO_BACKEND: Record<string, { areaServicio: string; categoria: string }> = {
  'agua-fuga': { areaServicio: 'AGUA', categoria: 'INFRAESTRUCTURA' },
  'agua-corte': { areaServicio: 'AGUA', categoria: 'SERVICIOS_PUBLICOS' },
  'agua-drenaje': { areaServicio: 'DRENAJE', categoria: 'INFRAESTRUCTURA' },
  'electrico-falla': { areaServicio: 'ALUMBRADO', categoria: 'INFRAESTRUCTURA' },
  'electrico-poste': { areaServicio: 'ALUMBRADO', categoria: 'SERVICIOS_PUBLICOS' },
  'electrico-cables': { areaServicio: 'ALUMBRADO', categoria: 'SEGURIDAD' },
  'municipal-bache': { areaServicio: 'BACHEO', categoria: 'INFRAESTRUCTURA' },
  'municipal-basura': { areaServicio: 'RECOLECCION_BASURA', categoria: 'LIMPIEZA' },
  'municipal-parque': { areaServicio: 'OTRO', categoria: 'SERVICIOS_PUBLICOS' },
}

// Componente para capturar clics en el mapa
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function ReportForm() {
  const navigate = useNavigate()

  // Estado del formulario
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [urgency, setUrgency] = useState<"leve" | "moderado" | "urgente">("moderado")
  const [openArea, setOpenArea] = useState<string | null>(null)

  // Ubicación
  const [location, setLocation] = useState<Location | null>(null)
  const [manualAddress, setManualAddress] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationType, setLocationType] = useState<"gps" | "manual" | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.6866, -100.3161])

  // Imagen
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Contacto
  const [showContact, setShowContact] = useState(false)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Envío
  const [isSubmitting, setIsSubmitting] = useState(false)

  // GPS
  const handleGetGPS = () => {
    if (!navigator.geolocation) return
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLocation({ lat, lng })
        setLocationType("gps")
        setMapCenter([lat, lng])
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, { headers: { 'Accept-Language': 'es' } })
          const data = await res.json()
          if (data.display_name) setManualAddress(data.display_name)
        } catch { /* ignorar */ }
        setIsGettingLocation(false)
      },
      () => setIsGettingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Clic en mapa
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setLocation({ lat, lng })
    setLocationType("gps")
    setMapCenter([lat, lng])
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, { headers: { 'Accept-Language': 'es' } })
      .then(res => res.json())
      .then(data => { if (data.display_name) setManualAddress(data.display_name) })
      .catch(() => { })
  }, [])

  // Imagen
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) { setImageError('Formato: JPG, PNG o WEBP'); return }
    if (file.size > 10 * 1024 * 1024) { setImageError('Maximo 10MB'); return }
    setImageError(null)
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Progreso
  const getProgress = () => {
    let count = 0
    if (title.trim()) count++
    if (description.trim()) count++
    if (category) count++
    if (location) count++
    return count
  }

  // Enviar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !category || !location) return
    setIsSubmitting(true)
    try {
      const backendCat = CATEGORY_TO_BACKEND[category]
      if (!backendCat) { setIsSubmitting(false); return }
      const resultado = await crearReporte({
        titulo: title.trim(),
        descripcion: description.trim() || undefined,
        areaServicio: backendCat.areaServicio,
        categoria: backendCat.categoria,
        tipoUbicacion: 'PUNTO',
        latitud: location.lat ?? undefined,
        longitud: location.lng ?? undefined,
        direccion: manualAddress.trim() || undefined,
        contactoEmail: email.trim() || undefined,
        contactoTelefono: phone.trim() || undefined,
        fotoUrl: null,
      })
      if (resultado.error) { alert(resultado.error.error); return }
      if (resultado.data) {
        navigate('/reporte-detalle', {
          state: {
            reporte: resultado.data.reporte,
            orientacionIA: resultado.data.orientacionIA,
          }
        })
      }

    } catch { alert('Error al enviar.') }
    finally { setIsSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Formulario de reporte</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Reportar un problema de servicio</h1>
          <p className="text-sm text-gray-500 mt-1">Todos los campos marcados con * son obligatorios.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMNA PRINCIPAL */}
          <div className="lg:col-span-2 space-y-5">

            {/* Información del reporte */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Informacion del reporte
              </h2>

              {/* Título */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Titulo del reporte *</label>
                <Input
                  placeholder="Ej: Fuga de agua en esquina de Av. Principal y Calzada del Valle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                  className="h-11 text-sm border-gray-200"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Un titulo claro ayuda a identificar el problema mas rapido.</span>
                  <span className="text-xs text-gray-400">{title.length}/120</span>
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Descripcion *</label>
                <textarea
                  placeholder="Describe el problema con el mayor detalle posible: ¿Que pasa? ¿Desde cuando? ¿Cuantas personas afecta?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 600))}
                  rows={4}
                  disabled={isSubmitting}
                  className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Incluye cuando ocurrio, si hay personas afectadas y cualquier detalle relevante.</span>
                  <span className="text-xs text-gray-400">{description.length}/600</span>
                </div>
              </div>

              {/* Nivel de urgencia */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Nivel de urgencia</label>
                <div className="grid grid-cols-3 gap-3">
                  <button type="button" onClick={() => setUrgency("leve")}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${urgency === 'leve' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="text-sm font-semibold text-gray-800">Leve</span>
                    <span className="text-[10px] text-gray-500">No representa riesgo</span>
                  </button>
                  <button type="button" onClick={() => setUrgency("moderado")}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${urgency === 'moderado' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-sm font-semibold text-gray-800">Moderado</span>
                    <span className="text-[10px] text-gray-500">Afecta movilidad o servicio</span>
                  </button>
                  <button type="button" onClick={() => setUrgency("urgente")}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${urgency === 'urgente' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-sm font-semibold text-gray-800">Urgente</span>
                    <span className="text-[10px] text-gray-500">Peligro inmediato</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Categoría con acordeón */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Categoria del problema *
              </h2>
              <div className="space-y-2">
                {AREA_CATEGORIES.map((area) => (
                  <div key={area.key} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenArea(openArea === area.key ? null : area.key)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${area.bgColor} rounded-lg flex items-center justify-center`}>
                          <area.icon className={`w-4 h-4 ${area.color}`} />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{area.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {category && area.items.find(i => i.value === category) && (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-full">
                            {area.items.find(i => i.value === category)?.label}
                          </span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openArea === area.key ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {openArea === area.key && (
                      <div className="px-4 pb-3 flex flex-wrap gap-2">
                        {area.items.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setCategory(item.value)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${category === item.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ubicación con mapa interactivo */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Ubicacion del problema *
              </h2>

              <label className="text-sm font-semibold text-gray-700 mb-2 block">Direccion</label>
              <div className="flex gap-2 mb-4">
                <Button type="button" onClick={handleGetGPS} disabled={isGettingLocation}
                  className={`text-xs font-semibold px-4 py-2.5 rounded-lg ${location && locationType === 'gps' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'}`}
                >
                  {location && locationType === 'gps' ? <><Check className="w-3.5 h-3.5 mr-1" /> Ubicado</> : <><Navigation className="w-3.5 h-3.5 mr-1" /> Usar GPS</>}
                </Button>
                <Input
                  placeholder="Ingresa la direccion manualmente..."
                  value={manualAddress}
                  onChange={(e) => { setManualAddress(e.target.value); if (e.target.value.trim()) { setLocation({ address: e.target.value }); setLocationType("manual") } }}
                  className="flex-1 h-10 text-sm border-gray-200"
                  disabled={isSubmitting}
                />
              </div>

              {/* Mapa interactivo */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Posicion en el mapa</p>
                <p className="text-xs text-gray-400 mb-2">Haz clic en el mapa para ajustar la ubicacion del pin.</p>
                <div className="rounded-xl overflow-hidden border border-gray-200 h-70">
                  <MapContainer center={mapCenter} zoom={13} className="h-full w-full" style={{ zIndex: 0 }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onMapClick={handleMapClick} />
                    {location?.lat && location?.lng && (
                      <Marker position={[location.lat, location.lng]} icon={mapPin} />
                    )}
                  </MapContainer>
                </div>
                {location?.lat && location?.lng && (
                  <p className="text-xs text-gray-400 mt-2 text-right">{location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°W</p>
                )}
              </div>
            </div>

            {/* Evidencia fotográfica */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Evidencia fotografica
                </h2>
                <span className="text-xs text-gray-400">0/4 fotos</span>
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center text-sm font-bold hover:bg-red-600">&times;</button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">Arrastra tus fotos aqui</span>
                  <span className="text-xs text-gray-400">o haz clic para seleccionar — JPG, PNG, HEIC hasta 10 MB</span>
                </button>
              )}
              {imageError && <p className="text-xs text-red-500 mt-2">{imageError}</p>}
            </div>

            {/* Datos de contacto (colapsable) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Datos de contacto
                  <span className="text-xs font-normal text-gray-400 uppercase ml-1">Opcional</span>
                </h2>
                <button type="button" onClick={() => setShowContact(!showContact)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showContact ? 'rotate-180' : ''}`} />
                  {showContact ? 'Ocultar' : 'Añadir'}
                </button>
              </div>
              {showContact && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-gray-500">Proporciona tus datos para recibir actualizaciones sobre tu reporte. Tu informacion es confidencial.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Correo electronico</label>
                      <Input placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-sm border-gray-200" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Telefono</label>
                      <Input placeholder="81 XXXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 text-sm border-gray-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botón enviar */}
            <Button type="submit" disabled={isSubmitting || !title.trim() || !category || !location} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg disabled:opacity-50">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</> : <><FileText className="w-4 h-4 mr-2" /> Enviar Reporte</>}
            </Button>
            {(!title.trim() || !category || !location) && (
              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1"><Info className="w-3 h-3" /> Completa titulo, categoria y ubicacion para continuar</p>
            )}
          </div>

          {/* SIDEBAR DERECHA */}
          <div className="space-y-4">
            {/* Progreso del reporte */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Progreso del reporte</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Titulo', done: !!title.trim() },
                  { label: 'Descripcion', done: !!description.trim() },
                  { label: 'Categoria', done: !!category },
                  { label: 'Ubicacion', done: !!location },
                  { label: 'Foto adjunta', done: !!imageFile, optional: true },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${step.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {step.done && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-xs ${step.done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{step.label}</span>
                    {step.optional && <span className="text-[10px] text-gray-300 ml-auto uppercase">Opcional</span>}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">{getProgress()} / 5 campos completados</span>
              </div>
            </div>

            {/* Vista previa */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Vista previa del reporte</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Titulo</span><span className="text-gray-800 font-medium truncate max-w-35">{title || 'Sin titulo aun...'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Urgencia</span><span className={`font-semibold ${urgency === 'leve' ? 'text-green-600' : urgency === 'moderado' ? 'text-amber-600' : 'text-red-600'}`}>{urgency === 'leve' ? 'Leve' : urgency === 'moderado' ? 'Moderado' : 'Urgente'}</span></div>
              </div>
            </div>

            {/* Info de seguimiento */}
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-5">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">¿Como dar seguimiento?</p>
                  <p className="text-xs text-gray-500 mt-1">Guarda tu numero de folio. Podras consultarlo en la pagina principal o con las notificaciones por correo.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de éxito */}
      
    </div>
  )
}

export default ReportForm
