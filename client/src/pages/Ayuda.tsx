import { Phone, FileText, Search, MapPin, Clock, HelpCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const FAQ = [
  {
    pregunta: '¿Necesito crear una cuenta para reportar?',
    respuesta: 'No. La plataforma es completamente publica. Solo necesitas llenar el formulario y recibiras un folio de seguimiento para consultar tu reporte.'
  },
  {
    pregunta: '¿Como doy seguimiento a mi reporte?',
    respuesta: 'Con el codigo de folio que recibes al crear tu reporte (ej: REP-001), puedes consultar el estado en cualquier momento desde la seccion "Mis reportes".'
  },
  {
    pregunta: '¿Que tipo de problemas puedo reportar?',
    respuesta: 'Puedes reportar problemas de agua y drenaje (fugas, cortes, presion baja), electricidad (alumbrado publico, postes caidos, cables) y servicios municipales (baches, basura, parques).'
  },
  {
    pregunta: '¿Como funciona la Guia con IA?',
    respuesta: 'Cuando creas un reporte, nuestro sistema de inteligencia artificial te orienta sobre a que institucion contactar.'
  },
  {
    pregunta: '¿Cuanto tiempo tarda en resolverse un reporte?',
    respuesta: 'El tiempo promedio de resolucion es de 3.2 dias, aunque puede variar dependiendo del tipo de problema y la institucion responsable.'
  },
  {
    pregunta: '¿Puedo subir fotos como evidencia?',
    respuesta: 'Si. Puedes subir hasta una foto en formato JPG, PNG o WEBP (maximo 5MB) para documentar el problema. Esto ayuda a que la institucion entienda mejor la situacion.'
  },
  {
    pregunta: '¿Que hago si mi reporte no avanza?',
    respuesta: 'Consulta el detalle de tu reporte donde encontraras la orientacion institucional: numero de telefono, sitio web y un guion sugerido para comunicarte directamente con la dependencia responsable.'
  },
  {
    pregunta: '¿El mapa de incidencias es en tiempo real?',
    respuesta: 'Si. El mapa muestra todos los reportes activos con ubicacion GPS. Puedes filtrar por area de servicio y estado para ver los problemas reportados en tu zona.'
  }
]

export default function Ayuda() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-6 py-12 max-w-4xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Ayuda</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Encuentra respuestas a las preguntas mas frecuentes sobre la plataforma.
          </p>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link to="/crear-reporte" className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Crear reporte</p>
              <p className="text-xs text-gray-500">Reporta un problema</p>
            </div>
          </Link>

          <Link to="/mis-reportes" className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Consultar folio</p>
              <p className="text-xs text-gray-500">Busca tu reporte</p>
            </div>
          </Link>

          <Link to="/mapa" className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Ver mapa</p>
              <p className="text-xs text-gray-500">Incidencias activas</p>
            </div>
          </Link>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQ.map((item, index) => (
              <details key={index} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-semibold text-gray-800 pr-4">{item.pregunta}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{item.respuesta}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div className="bg-linear-to-r from-indigo-700 to-blue-700 rounded-2xl p-8 text-white text-center">
          <Phone className="w-8 h-8 mx-auto mb-3 opacity-80" />
          <h3 className="text-xl font-bold mb-2">¿Necesitas ayuda inmediata?</h3>
          <p className="text-blue-200 text-sm mb-5 max-w-md mx-auto">
            Para emergencias o problemas urgentes que requieran atencion inmediata, comunicate directamente.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="tel:072"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-sm px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              072 - Atencion Ciudadana
            </a>
            <a
              href="tel:911"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Phone className="w-4 h-4" />
              911 - Emergencias
            </a>
          </div>
        </div>

        {/* Horarios */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>La plataforma esta disponible 24/7. Los tiempos de respuesta pueden variar segun la institucion.</span>
        </div>

      </div>
    </div>
  )
}
