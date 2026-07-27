import { useState, useRef } from "react"
import type { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Location } from "@/types/report"
import { MapPin, Navigation, Loader2, FileText, Camera, Upload, CheckCircle, WavesHorizontal, UtilityPole, Building2, Check, Copy } from "lucide-react"
import { Link } from "react-router-dom"

// Categorías agrupadas por área de servicio
const CATEGORIES = {
  agua: {
    label: "AGUA",
    icon: WavesHorizontal,
    color: "text-blue-600",
    items: [
      { value: "agua-fuga", label: "Fuga de agua" },
      { value: "agua-corte", label: "Corte de suministro" },
      { value: "agua-presion", label: "Presion baja" },
      { value: "agua-drenaje", label: "Drenaje obstruido" },
    ],
  },
  electrico: {
    label: "ELECTRICO",
    icon: UtilityPole,
    color: "text-yellow-600",
    items: [
      { value: "electrico-falla", label: "Falla electrica" },
      { value: "electrico-poste", label: "Poste caido" },
      { value: "electrico-alumbrado", label: "Alumbrado publico" },
      { value: "electrico-cables", label: "Cables peligrosos" },
    ],
  },
  municipales: {
    label: "MUNICIPALES",
    icon: Building2,
    color: "text-green-600",
    items: [
      { value: "municipal-bache", label: "Bache / pavimento" },
      { value: "municipal-basura", label: "Recoleccion de basura" },
      { value: "municipal-parque", label: "Parque danado" },
      { value: "municipal-senalizacion", label: "Senalizacion" },
    ],
  },
}

function ReportForm() {
  // Estado para campos del formulario
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")

  // Estado para errores de validación
  const [validationErrors, setValidationErrors] = useState<{
    title?: string
    description?: string
    category?: string
    location?: string
  }>({})

  // Estado para ubicación
  const [location, setLocation] = useState<Location | null>(null)
  const [manualAddress, setManualAddress] = useState("")
  const [gpsAddress, setGpsAddress] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationType, setLocationType] = useState<"gps" | "manual" | null>(null)

  // Estado para imagen
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const isCameraAvailable = !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Estado para indicador de carga HTTP
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedCode, setSubmittedCode] = useState<string | null>(null)

  // Función para obtener ubicación GPS
  const handleGetGPSLocation = () => {
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("Tu navegador no soporta geolocalizacion")
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setLocation(newLocation)
        setLocationType("gps")
        setManualAddress("")

        // Reverse geocoding para obtener dirección legible
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'es' } }
          )
          const data = await response.json()
          if (data.address) {
            const addr = data.address
            const road = addr.road || addr.pedestrian || addr.street || ''
            const houseNumber = addr.house_number ? ` #${addr.house_number}` : ''
            const neighbourhood = addr.neighbourhood || addr.suburb || addr.quarter || ''
            const city = addr.city || addr.town || addr.village || addr.municipality || ''
            const state = addr.state || ''

            const parts = [
              road ? `${road}${houseNumber}` : '',
              neighbourhood ? `Col. ${neighbourhood}` : '',
              city,
              state ? `${state}` : ''
            ].filter(Boolean)

            setGpsAddress(parts.join(', '))
          } else {
            setGpsAddress(`Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`)
          }
        } catch {
          setGpsAddress(`Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`)
        }

        setIsGettingLocation(false)

        if (validationErrors.location) {
          setValidationErrors(prev =>
            Object.fromEntries(Object.entries(prev).filter(([key]) => key !== 'location'))
          )
        }
      },
      (error) => {
        setIsGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Permiso de ubicacion denegado. Habilita el acceso en tu navegador.")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Informacion de ubicacion no disponible.")
            break
          case error.TIMEOUT:
            setLocationError("La solicitud de ubicacion ha excedido el tiempo de espera.")
            break
          default:
            setLocationError("Error desconocido al obtener la ubicacion.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Función para manejar dirección manual
  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value
    setManualAddress(address)

    if (address.trim()) {
      setLocation({ address })
      setLocationType("manual")

      if (validationErrors.location) {
        setValidationErrors(prev =>
          Object.fromEntries(Object.entries(prev).filter(([key]) => key !== 'location'))
        )
      }
    } else {
      if (locationType === "manual") {
        setLocation(null)
        setLocationType(null)
      }
    }
  }

  // Validar tipo y tamaño de archivo de imagen
  const validateImage = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    if (!validTypes.includes(file.type)) {
      return 'El archivo debe ser de tipo JPG, PNG o WEBP'
    }

    if (file.size > maxSize) {
      return 'El tamano del archivo no debe exceder 5MB'
    }

    return null
  }

  // Manejar selección de archivo de imagen
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const error = validateImage(file)

    if (error) {
      setImageError(error)
      setImageFile(null)
      setImagePreview(null)
      return
    }

    setImageError(null)
    setImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraButtonClick = () => {
    cameraInputRef.current?.click()
  }

  const handleClearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  // Validar campos obligatorios
  const validateForm = (): boolean => {
    const errors: {
      title?: string
      description?: string
      category?: string
      location?: string
    } = {}

    if (!title.trim()) {
      errors.title = "El titulo es obligatorio"
    }

    if (!description.trim()) {
      errors.description = "La descripcion es obligatoria"
    }

    if (!category.trim()) {
      errors.category = "La categoria es obligatoria"
    }

    if (!location) {
      errors.location = "La ubicacion es obligatoria"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar cambio en título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)

    if (validationErrors.title && value.trim()) {
      setValidationErrors(prev =>
        Object.fromEntries(Object.entries(prev).filter(([key]) => key !== 'title'))
      )
    }
  }

  // Manejar cambio en descripción (limitado a 500 caracteres)
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 500) {
      setDescription(value)
    }

    if (validationErrors.description && value.trim()) {
      setValidationErrors(prev =>
        Object.fromEntries(Object.entries(prev).filter(([key]) => key !== 'description'))
      )
    }
  }

  // Manejar selección de categoría (chips)
  const handleCategorySelect = (value: string) => {
    setCategory(value)

    if (validationErrors.category) {
      setValidationErrors(prev =>
        Object.fromEntries(Object.entries(prev).filter(([key]) => key !== 'category'))
      )
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const trackingCode = `REP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

      console.log('Formulario valido, preparando envio:', {
        title,
        description,
        category,
        location,
        image: imageFile,
        trackingCode
      })

      setSubmittedCode(trackingCode)

      setTitle("")
      setDescription("")
      setCategory("")
      setLocation(null)
      setManualAddress("")
      setGpsAddress(null)
      setLocationType(null)
      setImageFile(null)
      setImagePreview(null)
      setValidationErrors({})
    } catch (error) {
      console.error('Error al enviar el reporte:', error)
      alert('Error al enviar el reporte. Por favor, intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-10 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Crear Reporte</h1>
          <p className="text-sm text-gray-500">
            Completa el formulario para registrar tu reporte. No necesitas cuenta.
          </p>
        </div>

        <form className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start" onSubmit={handleSubmit}>
          {/* Sección 1: Información del problema */}
          <div>
            <Card className="shadow-sm border border-blue-100 overflow-hidden">
              <CardHeader className="bg-[#EFF6FF] border-b border-blue-100 py-3 px-5">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <h2 className="text-sm font-bold text-gray-800">1. Informacion del problema</h2>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4 bg-white">
                {/* Título */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Titulo del problema <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Ej: Fuga de agua en calle principal"
                    value={title}
                    onChange={handleTitleChange}
                    className={`h-10 text-sm ${validationErrors.title ? "border-red-400" : "border-gray-200"}`}
                    disabled={isSubmitting}
                  />
                  {validationErrors.title && (
                    <p className="text-xs text-red-500">{validationErrors.title}</p>
                  )}
                </div>

                {/* Categoría como chips */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Categoria <span className="text-red-500">*</span>
                  </label>

                  {Object.entries(CATEGORIES).map(([key, group]) => (
                    <div key={key} className="space-y-1.5">
                      <p className={`text-xs font-bold uppercase tracking-wide ${group.color} flex items-center gap-1.5`}>
                        <group.icon className="w-3.5 h-3.5" /> {group.label}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {group.items.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleCategorySelect(item.value)}
                            className={`px-3 py-2 text-xs rounded-lg border text-left transition-all ${category === item.value
                                ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {validationErrors.category && (
                    <p className="text-xs text-red-500">{validationErrors.category}</p>
                  )}
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Descripcion <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Describe el problema con detalle: ¿cuando comenzo?, ¿que tan grave es?, ¿cuantas personas afecta?"
                    value={description}
                    onChange={handleDescriptionChange}
                    rows={3}
                    disabled={isSubmitting}
                    className={`flex w-full rounded-lg border bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none ${validationErrors.description ? "border-red-400" : "border-gray-200"
                      }`}
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-gray-400">{description.length}/500</span>
                  </div>
                  {validationErrors.description && (
                    <p className="text-xs text-red-500">{validationErrors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha: Ubicación, Evidencia y Enviar */}
          <div className="space-y-5">

            {/* Sección 2: Ubicación */}
            <Card className="shadow-sm border border-blue-100 overflow-hidden">
              <CardHeader className="bg-[#EFF6FF] border-b border-blue-100 py-3 px-5">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-800">2. Ubicacion</h2>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3 bg-white">
                {/* Botón GPS */}
                {location && locationType === "gps" ? (
                  <div className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border-2 border-green-400 bg-green-50 text-green-700 font-semibold text-sm">
                    <Check className="h-4 w-4" />
                    Ubicacion detectada
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleGetGPSLocation}
                    disabled={isGettingLocation || isSubmitting}
                    className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg shadow-sm"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    {isGettingLocation ? "Obteniendo ubicacion..." : "Usar mi ubicacion (GPS)"}
                  </Button>
                )}

                {/* Separador */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-gray-400">O escribe la direccion</span>
                  </div>
                </div>

                {/* Input dirección manual */}
                {!(location && locationType === "gps") && (
                  <Input
                    placeholder="Ej: Av. Juarez #45, Col. Centro"
                    value={manualAddress}
                    onChange={handleManualAddressChange}
                    className="h-10 text-sm border-gray-200"
                    disabled={isGettingLocation || isSubmitting}
                  />
                )}

                {/* Dirección detectada por GPS */}
                {location && locationType === "gps" && gpsAddress && (
                  <div className="rounded-lg border border-green-200 bg-white px-3 py-2.5 text-sm text-gray-700">
                    {gpsAddress}
                  </div>
                )}

                {/* Dirección manual confirmada */}
                {location && locationType === "manual" && location.address && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 text-sm text-blue-700">
                    {location.address}
                  </div>
                )}

                {/* Error de validación */}
                {validationErrors.location && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-600">
                    {validationErrors.location}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sección 3: Evidencia fotográfica */}
            <Card className="shadow-sm border border-blue-100 overflow-hidden">
              <CardHeader className="bg-[#EFF6FF] border-b border-blue-100 py-3 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-gray-800">3. Evidencia fotografica</h2>
                  </div>
                  <span className="text-xs text-gray-400">Opcional</span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3 bg-white">
                {/* Inputs ocultos */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Seleccionar imagen desde archivo"
                />
                {isCameraAvailable && (
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Capturar imagen desde camara"
                  />
                )}

                {imagePreview ? (
                  <div className="relative">
                    <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                      <img
                        src={imagePreview}
                        alt="Preview de imagen seleccionada"
                        className="w-full h-auto max-h-48 object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors"
                    >
                      <span className="text-base font-bold">&times;</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleFileButtonClick}
                        disabled={isSubmitting}
                        className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-lg bg-[#9810FA] hover:bg-purple-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-xs">Subir archivo</span>
                      </button>

                      {isCameraAvailable && (
                        <button
                          type="button"
                          onClick={handleCameraButtonClick}
                          disabled={isSubmitting}
                          className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-lg bg-[#E60076] hover:bg-pink-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Camera className="w-5 h-5" />
                          <span className="text-xs">Tomar foto</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      JPG, PNG, WEBP &middot; Max 5MB
                    </p>
                  </>
                )}

                {imageError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600">{imageError}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botón de envío */}
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Enviar Reporte
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Modal de éxito */}
        {submittedCode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-8 text-center space-y-6">
              {/* Icono check verde */}
              <div className="w-16 h-16 border-4 border-green-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-9 h-9 text-green-500 stroke-[3]" />
              </div>

              {/* Título y subtítulo */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Reporte Enviado!</h3>
                <p className="text-gray-500 text-sm">
                  Tu reporte ha sido registrado exitosamente.<br />
                  Guarda tu codigo de seguimiento.
                </p>
              </div>

              {/* Código de seguimiento */}
              <div className="border-2 border-blue-200 rounded-xl p-5 bg-[#EFF6FF] ">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Codigo de seguimiento</p>
                <p className="text-3xl font-bold text-blue-700">{submittedCode}</p>
              </div>

              {/* Botón copiar código */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(submittedCode)
                  alert('Codigo copiado al portapapeles')
                }}
                className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <Copy className="w-5 h-5" />
                Copiar codigo
              </button>

              {/* Consultar mi reporte */}
              <Link
                to="/mis-reportes"
                onClick={() => setSubmittedCode(null)}
                className="w-full h-12 flex items-center justify-center border-2 border-gray-200 text-blue-700 font-bold rounded-xl hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                Consultar mi reporte
              </Link>

              {/* Ir al inicio */}
              <Link
                to="/"
                onClick={() => setSubmittedCode(null)}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportForm
