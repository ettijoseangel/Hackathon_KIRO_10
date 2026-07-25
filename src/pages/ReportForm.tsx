import { useState, useRef } from "react"
import type { ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Location } from "@/types/report"
import { MapPin, Navigation, Loader2 } from "lucide-react"

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
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationType, setLocationType] = useState<"gps" | "manual" | null>(null)

  // Estado para imagen
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  // Estado para indicar si la cámara está disponible (detectado al montar)
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
      setLocationError("Tu navegador no soporta geolocalización")
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setLocation(newLocation)
        setLocationType("gps")
        setIsGettingLocation(false)
        setManualAddress("") // Limpiar dirección manual si existía
        
        // Eliminar error de ubicación en tiempo real cuando se capture exitosamente
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
            setLocationError("Permiso de ubicación denegado. Por favor, habilita el acceso a la ubicación en tu navegador.")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Información de ubicación no disponible.")
            break
          case error.TIMEOUT:
            setLocationError("La solicitud de ubicación ha excedido el tiempo de espera.")
            break
          default:
            setLocationError("Error desconocido al obtener la ubicación.")
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
      
      // Eliminar error de ubicación en tiempo real cuando el usuario corrija el campo
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
    const maxSize = 5 * 1024 * 1024 // 5MB en bytes

    if (!validTypes.includes(file.type)) {
      return 'El archivo debe ser de tipo JPG, PNG o WEBP'
    }

    if (file.size > maxSize) {
      return 'El tamaño del archivo no debe exceder 5MB'
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

    // Crear preview de la imagen
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Manejar clic en botón de carga desde archivo
  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Manejar clic en botón de captura desde cámara
  const handleCameraButtonClick = () => {
    cameraInputRef.current?.click()
  }

  // Limpiar imagen seleccionada
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
      errors.title = "El título es obligatorio"
    }

    if (!description.trim()) {
      errors.description = "La descripción es obligatoria"
    }

    if (!category.trim()) {
      errors.category = "La categoría es obligatoria"
    }

    if (!location) {
      errors.location = "La ubicación es obligatoria"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar cambio en título y eliminar error si existe
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)
    
    // Eliminar error en tiempo real cuando el usuario corrija el campo
    if (validationErrors.title && value.trim()) {
      setValidationErrors(prev =>
        Object.fromEntries(Object.entries(prev).filter(([key]) => key !== 'title'))
      )
    }
  }

  // Manejar cambio en descripción y eliminar error si existe
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setDescription(value)
    
    // Eliminar error en tiempo real cuando el usuario corrija el campo
    if (validationErrors.description && value.trim()) {
      setValidationErrors(prev =>
        Object.fromEntries(Object.entries(prev).filter(([key]) => key !== 'description'))
      )
    }
  }

  // Manejar cambio en categoría y eliminar error si existe
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setCategory(value)
    
    // Eliminar error en tiempo real cuando el usuario corrija el campo
    if (validationErrors.category && value.trim()) {
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

    // Simular operación HTTP POST
    setIsSubmitting(true)
    
    try {
      // Simular delay de red (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // TODO: Aquí se implementará la petición HTTP POST real al backend
      // El backend debe retornar un código de seguimiento único
      const trackingCode = `REP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      
      console.log('Formulario válido, preparando envío:', {
        title,
        description,
        category,
        location,
        image: imageFile,
        trackingCode
      })
      
      // Guardar el código de seguimiento
      setSubmittedCode(trackingCode)
      
      // Limpiar formulario después del envío exitoso
      setTitle("")
      setDescription("")
      setCategory("")
      setLocation(null)
      setManualAddress("")
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
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Header del formulario con diseño más saturado */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-10 text-white shadow-2xl border-4 border-indigo-800">
        <h1 className="text-4xl font-bold mb-3">Crear Reporte Ciudadano</h1>
        <p className="text-lg text-blue-100 font-medium">
          Completa el formulario para reportar un problema en tu comunidad
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Sección de Información Básica con más contraste */}
        <Card className="shadow-xl border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
            <CardTitle className="text-xl font-bold text-gray-800">Información del Reporte</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Completa los detalles del problema que deseas reportar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo de Título */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ej: Bache en calle principal"
                value={title}
                onChange={handleTitleChange}
                className={validationErrors.title ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {validationErrors.title && (
                <p className="text-sm text-destructive">
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Campo de Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="description"
                placeholder="Describe el problema con detalle..."
                value={description}
                onChange={handleDescriptionChange}
                rows={4}
                disabled={isSubmitting}
                className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                  validationErrors.description ? "border-destructive" : ""
                }`}
              />
              {validationErrors.description && (
                <p className="text-sm text-destructive">
                  {validationErrors.description}
                </p>
              )}
            </div>

            {/* Campo de Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <select
                id="category"
                value={category}
                onChange={handleCategoryChange}
                disabled={isSubmitting}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                  validationErrors.category ? "border-destructive" : ""
                }`}
              >
                <option value="">Selecciona una categoría</option>
                <optgroup label="Servicio de Agua">
                  <option value="agua-fuga">Fuga de agua</option>
                  <option value="agua-falta">Falta de agua</option>
                  <option value="agua-drenaje">Drenaje / Alcantarillado</option>
                  <option value="agua-otro">Otro (Agua)</option>
                </optgroup>
                <optgroup label="Servicio Eléctrico">
                  <option value="electrico-alumbrado">Alumbrado público</option>
                  <option value="electrico-postes">Postes / Cables caídos</option>
                  <option value="electrico-otro">Otro (Eléctrico)</option>
                </optgroup>
                <optgroup label="Servicios Municipales">
                  <option value="municipal-baches">Baches</option>
                  <option value="municipal-basura">Basura acumulada</option>
                  <option value="municipal-areas-verdes">Áreas verdes</option>
                  <option value="municipal-senalizacion">Señalización</option>
                  <option value="municipal-otro">Otro (Municipal)</option>
                </optgroup>
              </select>
              {validationErrors.category && (
                <p className="text-sm text-destructive">
                  {validationErrors.category}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección de Ubicación con más contraste */}
        <Card className="shadow-xl border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
            <CardTitle className="text-xl font-bold text-gray-800">
              Ubicación del Problema <span className="text-destructive">*</span>
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Captura la ubicación mediante GPS o ingresa una dirección manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botón de GPS Automático con color */}
            <div className="space-y-2">
              <Label>Captura Automática</Label>
              <Button
                type="button"
                onClick={handleGetGPSLocation}
                disabled={isGettingLocation || isSubmitting}
                variant="outline"
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-2 border-green-700 shadow-lg font-semibold"
              >
                <Navigation className="mr-2 h-5 w-5" />
                {isGettingLocation ? "Obteniendo ubicación..." : "Usar Mi Ubicación (GPS)"}
              </Button>
            </div>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O</span>
              </div>
            </div>

            {/* Input Manual */}
            <div className="space-y-2">
              <Label htmlFor="manual-address">Ingreso Manual</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="manual-address"
                  placeholder="Ej: Calle Principal #123, Colonia Centro"
                  value={manualAddress}
                  onChange={handleManualAddressChange}
                  className="pl-10"
                  disabled={isGettingLocation || isSubmitting}
                />
              </div>
            </div>

            {/* Error de Ubicación */}
            {locationError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {locationError}
              </div>
            )}

            {/* Mostrar Coordenadas Capturadas */}
            {location && locationType === "gps" && location.lat && location.lng && (
              <div className="rounded-md bg-primary/10 p-3 text-sm">
                <p className="font-medium mb-1">Ubicación GPS capturada:</p>
                <p className="text-muted-foreground">
                  Latitud: {location.lat.toFixed(6)}
                </p>
                <p className="text-muted-foreground">
                  Longitud: {location.lng.toFixed(6)}
                </p>
              </div>
            )}

            {/* Mostrar Dirección Manual */}
            {location && locationType === "manual" && location.address && (
              <div className="rounded-md bg-primary/10 p-3 text-sm">
                <p className="font-medium mb-1">Dirección ingresada:</p>
                <p className="text-muted-foreground">{location.address}</p>
              </div>
            )}

            {/* Error de validación de ubicación */}
            {validationErrors.location && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {validationErrors.location}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección de Evidencia Visual con más contraste */}
        <Card className="shadow-xl border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
            <CardTitle className="text-xl font-bold text-gray-800">Evidencia Visual (Opcional)</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Adjunta una imagen del problema para facilitar su evaluación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input file oculto para selección desde archivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Seleccionar imagen desde archivo"
            />

            {/* Input file oculto para captura desde cámara */}
            {isCameraAvailable && (
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Capturar imagen desde cámara"
              />
            )}

            {/* Botones de acción con colores */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleFileButtonClick}
                disabled={isSubmitting}
                className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-2 border-purple-700 shadow-lg font-semibold"
              >
                📁 Cargar desde archivo
              </Button>
              
              {isCameraAvailable && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraButtonClick}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white border-2 border-pink-700 shadow-lg font-semibold"
                >
                  📷 Capturar con cámara
                </Button>
              )}
            </div>

            {/* Mensaje de error */}
            {imageError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{imageError}</p>
              </div>
            )}

            {/* Preview de la imagen */}
            {imagePreview && (
              <div className="space-y-3">
                <Label>Vista previa:</Label>
                <div className="relative border rounded-lg overflow-hidden bg-slate-50">
                  <img
                    src={imagePreview}
                    alt="Preview de imagen seleccionada"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
                
                {/* Información del archivo */}
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-md">
                  <div className="text-sm">
                    <p className="font-medium">{imageFile?.name}</p>
                    <p className="text-muted-foreground">
                      {imageFile && (imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleClearImage}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md font-semibold"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            )}

            {/* Información de ayuda */}
            {!imagePreview && (
              <div className="text-sm text-muted-foreground">
                <p>Formatos aceptados: JPG, PNG, WEBP</p>
                <p>Tamaño máximo: 5MB</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botón de Envío más destacado */}
        <div className="flex justify-end pt-6">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all border-2 border-indigo-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Reporte"
            )}
          </Button>
        </div>
      </form>

      {/* Modal de éxito con código de seguimiento */}
      {submittedCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full shadow-2xl border-4 border-green-500 animate-in fade-in zoom-in duration-300">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-b-4 border-green-700">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                ¡Reporte Enviado!
              </CardTitle>
              <CardDescription className="text-green-100 font-medium text-base">
                Tu reporte ha sido registrado exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-300">
                <Label className="text-sm font-bold text-gray-700 uppercase mb-2 block">
                  Código de Seguimiento
                </Label>
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-blue-400 shadow-md">
                  <span className="text-3xl font-black text-blue-700">{submittedCode}</span>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(submittedCode)
                      alert('Código copiado al portapapeles')
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-800 font-semibold"
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">
                  ⚠️ <strong>Importante:</strong> Guarda este código para consultar el estado de tu reporte en la sección "Mis Reportes".
                </p>
              </div>

              <Button
                onClick={() => setSubmittedCode(null)}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg border-2 border-green-700"
              >
                Entendido
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ReportForm
