import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Droplets,
  Zap,
  Building2,
  MapPin,
  FileText,
  RefreshCw,
  CheckCircle,
  CircleCheck,
  ArrowRight,
  Clock,
} from "lucide-react"

import {
  listarReportes,
  type Reporte,
} from "@/services/reporteService"


export default function Landing() {

  // ============================================================
  // ESTADOS
  // ============================================================

  const [reportesRecientes, setReportesRecientes] = useState<Reporte[]>([])
  const [searchCode, setSearchCode] = useState("")


  // ============================================================
  // CARGAR REPORTES RECIENTES
  // ============================================================

  useEffect(() => {

    async function cargarReportes() {

      const resultado = await listarReportes()

      if (resultado.data) {

        setReportesRecientes(
          resultado.data.reportes.slice(0, 5)
        )

      }

    }

    cargarReportes()

  }, [])


  // ============================================================
  // FORMATEAR TIEMPO
  // ============================================================

  const formatTimeAgo = (dateStr: string) => {

    const diff =
      Date.now() -
      new Date(dateStr).getTime()

    const minutes =
      Math.floor(diff / 60000)


    if (minutes < 60) {

      return `hace ${minutes} min`

    }


    const hours =
      Math.floor(minutes / 60)


    if (hours < 24) {

      return `hace ${hours}h`

    }


    const days =
      Math.floor(hours / 24)


    return `${days} dias`

  }


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="min-h-screen bg-white">


      {/* ====================================================== */}
      {/* NAVBAR */}
      {/* ====================================================== */}

      <nav className="
        bg-gradient-to-r
        from-indigo-700
        to-blue-700
        text-white
      ">

        <div className="
          container
          mx-auto
          px-6
          py-3.5
        ">

          <div className="
            flex
            items-center
            justify-between
            gap-6
          ">


            {/* LOGO */}
            <Link
              to="/"
              className="
                flex
                items-center
                gap-2.5
                flex-shrink-0
              "
            >

              <div className="
                w-8
                h-8
                bg-white/20
                rounded-lg
                flex
                items-center
                justify-center
              ">

                <MapPin className="w-4 h-4" />

              </div>


              <div className="hidden sm:block">

                <span className="
                  block
                  text-sm
                  font-bold
                  leading-none
                ">
                  Reporte Cívico
                </span>

                <span className="
                  block
                  text-[9px]
                  text-blue-200
                  uppercase
                  tracking-wider
                  mt-1
                ">
                  Plataforma Ciudadana
                </span>

              </div>

            </Link>


            {/* NAVEGACIÓN */}
            <div className="
              hidden
              md:flex
              items-center
              gap-6
            ">

              <Link
                to="/"
                className="
                  text-sm
                  font-medium
                  text-white/90
                  hover:text-white
                  transition-colors
                "
              >
                Inicio
              </Link>


              <Link
                to="/mis-reportes"
                className="
                  text-sm
                  font-medium
                  text-white/90
                  hover:text-white
                  transition-colors
                "
              >
                Mis reportes
              </Link>


              <Link
                to="/mapa"
                className="
                  text-sm
                  font-medium
                  text-white/90
                  hover:text-white
                  transition-colors
                "
              >
                Mapa
              </Link>


              <Link
                to="/ayuda"
                className="
                  text-sm
                  font-medium
                  text-white/90
                  hover:text-white
                  transition-colors
                "
              >
                Ayuda
              </Link>

            </div>


            {/* BOTÓN CREAR REPORTE */}
            <Link
              to="/crear-reporte"
              className="
                bg-white
                text-indigo-700
                font-bold
                text-sm
                px-5
                py-2.5
                rounded-lg
                hover:bg-indigo-50
                transition-colors
                flex-shrink-0
              "
            >
              Crear reporte
            </Link>

          </div>

        </div>

      </nav>


      {/* ====================================================== */}
      {/* HERO SECTION */}
      {/* ====================================================== */}

      <section className="bg-white">

        <div className="
          grid
          grid-cols-1
          lg:grid-cols-2
          min-h-[560px]
        ">


          {/* ================================================== */}
          {/* COLUMNA IZQUIERDA */}
          {/* ================================================== */}

          <div className="
            flex
            items-center
            bg-white
          ">

            <div className="
              w-full
              max-w-2xl
              mx-auto
              px-8
              py-16
              lg:px-16
              xl:px-20
            ">


              {/* ETIQUETA SUPERIOR */}

              <div className="
                flex
                flex-wrap
                items-center
                gap-2
                mb-7
              ">

                <span className="
                  w-2
                  h-2
                  rounded-full
                  bg-emerald-500
                " />

                <span className="
                  text-xs
                  font-medium
                  text-gray-500
                  uppercase
                  tracking-[0.15em]
                ">
                  Plataforma Pública
                </span>

                <span className="text-gray-300">
                  •
                </span>

                <span className="
                  text-xs
                  font-medium
                  text-gray-400
                  uppercase
                  tracking-[0.15em]
                ">
                  Tu comunidad
                </span>

              </div>


              {/* TÍTULO */}

              <h1 className="
                text-4xl
                sm:text-5xl
                xl:text-6xl
                font-bold
                text-indigo-950
                leading-[1.05]
                tracking-[-0.03em]
                mb-7
              ">

                Reporta.{" "}

                <span className="text-indigo-600">
                  Orienta.
                </span>{" "}

                Resuelve.

              </h1>


              {/* DESCRIPCIÓN */}

              <p className="
                text-base
                sm:text-lg
                text-gray-500
                leading-relaxed
                max-w-xl
                mb-10
              ">

                Envía reportes de problemas de servicios urbanos
                y da seguimiento a su resolución
                en tiempo real.

              </p>


              {/* ================================================= */}
              {/* BUSCADOR DE FOLIO */}
              {/* ================================================= */}

              <div className="max-w-xl">

                <div className="
                  flex
                  items-center
                  gap-2
                  p-1.5
                  bg-white
                  border
                  border-indigo-100
                  rounded-xl
                  shadow-sm
                  focus-within:ring-2
                  focus-within:ring-indigo-100
                  transition-all
                ">


                  {/* INPUT */}

                  <div className="
                    relative
                    flex-1
                  ">

                    <Search className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      w-5
                      h-5
                      text-gray-400
                    " />


                    <input
                      type="text"
                      placeholder="Ingresa tu folio para ver el estatus"
                      value={searchCode}
                      onChange={(e) =>
                        setSearchCode(e.target.value)
                      }
                      className="
                        w-full
                        pl-12
                        pr-4
                        py-3.5
                        bg-transparent
                        text-sm
                        text-gray-700
                        placeholder:text-gray-400
                        focus:outline-none
                      "
                    />

                  </div>


                  {/* BOTÓN CONSULTAR */}

                  <Link
                    to={
                      searchCode.trim()
                        ? `/mis-reportes?codigo=${searchCode.trim()}`
                        : "/mis-reportes"
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      px-6
                      py-3
                      rounded-lg
                      bg-indigo-600
                      hover:bg-indigo-700
                      text-white
                      text-sm
                      font-semibold
                      transition-colors
                      whitespace-nowrap
                    "
                  >
                    Consultar
                  </Link>

                </div>


                {/* EJEMPLOS */}

                <div className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  mt-3
                ">

                  <span className="
                    text-xs
                    text-gray-400
                  ">
                    Ej:
                  </span>


                  <span className="
                    px-2.5
                    py-1
                    rounded-md
                    bg-indigo-50
                    text-indigo-500
                    text-[11px]
                    font-medium
                  ">
                    MTY-2024-09812
                  </span>


                  <span className="
                    px-2.5
                    py-1
                    rounded-md
                    bg-indigo-50
                    text-indigo-500
                    text-[11px]
                    font-medium
                  ">
                    MTY-2024-09801
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* ================================================== */}
          {/* COLUMNA DERECHA */}
          {/* PANEL MUNICIPAL */}
          {/* ================================================== */}

          <div className="
            relative
            min-h-[560px]
            overflow-hidden
            bg-gradient-to-br
            from-indigo-600
            via-indigo-700
            to-indigo-950
          ">


            {/* ================================================= */}
            {/* CUADRÍCULA */}
            {/* ================================================= */}

            <div
              className="
                absolute
                inset-0
                opacity-20
                pointer-events-none
              "
              style={{
                backgroundImage: `
                  linear-gradient(
                    to right,
                    rgba(255,255,255,0.25) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    to bottom,
                    rgba(255,255,255,0.25) 1px,
                    transparent 1px
                  )
                `,
                backgroundSize: "80px 80px",
              }}
            />


            {/* ================================================= */}
            {/* CONTENIDO */}
            {/* ================================================= */}

            <div className="
              relative
              z-10
              h-full
              flex
              flex-col
              items-center
              justify-center
              px-8
              py-14
            ">


              {/* ICONO MAPA */}

              <div className="
                relative
                flex
                items-center
                justify-center
                w-20
                h-20
                rounded-full
                border
                border-white/30
                bg-white/10
                backdrop-blur-sm
                mb-5
              ">

                <div className="
                  absolute
                  inset-[-10px]
                  rounded-full
                  border
                  border-white/20
                " />

                <MapPin
                  className="
                    w-10
                    h-10
                    text-white
                  "
                  strokeWidth={2}
                />

              </div>


              {/* CIUDAD */}

              <h2 className="
                text-2xl
                md:text-3xl
                font-bold
                text-white
                text-center
                leading-tight
              ">

                Tu Ciudad,
                <br />
                Tu Voz

              </h2>


              {/* SUBTÍTULO */}

              <p className="
                mt-3
                text-[10px]
                md:text-xs
                font-medium
                tracking-[0.25em]
                text-indigo-200
                uppercase
              ">
                Plataforma Ciudadana
              </p>


              {/* ================================================= */}
              {/* REPORTES RECIENTES */}
              {/* ================================================= */}

              <div className="
                w-full
                max-w-md
                mt-9
                space-y-2
              ">


                {/* REPORTE 1 */}

                <div className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3.5
                  rounded-xl
                  border
                  border-white/20
                  bg-white/10
                  backdrop-blur-md
                ">

                  <span className="
                    w-2
                    h-2
                    rounded-full
                    bg-emerald-400
                    flex-shrink-0
                  " />


                  <div className="min-w-0">

                    <p className="
                      text-sm
                      font-semibold
                      text-white
                      truncate
                    ">
                      Nuevo reporte recibido
                    </p>

                    <p className="
                      text-[11px]
                      text-indigo-200
                      mt-0.5
                    ">
                      hace 3 min
                    </p>

                  </div>

                </div>


                {/* REPORTE 2 */}

                <div className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3.5
                  rounded-xl
                  border
                  border-white/20
                  bg-white/10
                  backdrop-blur-md
                ">

                  <span className="
                    w-2
                    h-2
                    rounded-full
                    bg-cyan-400
                    flex-shrink-0
                  " />


                  <div className="min-w-0">

                    <p className="
                      text-sm
                      font-semibold
                      text-white
                      truncate
                    ">
                      Bache en Av. Morones Prieto
                    </p>

                    <p className="
                      text-[11px]
                      text-indigo-200
                      mt-0.5
                    ">
                      hace 8 min
                    </p>

                  </div>

                </div>


                {/* REPORTE 3 */}

                <div className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3.5
                  rounded-xl
                  border
                  border-white/20
                  bg-white/10
                  backdrop-blur-md
                ">

                  <span className="
                    w-2
                    h-2
                    rounded-full
                    bg-amber-400
                    flex-shrink-0
                  " />


                  <div className="min-w-0">

                    <p className="
                      text-sm
                      font-semibold
                      text-white
                      truncate
                    ">
                      Fuga resuelta - Col. Del Valle
                    </p>

                    <p className="
                      text-[11px]
                      text-indigo-200
                      mt-0.5
                    ">
                      hace 12 min
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ====================================================== */}
      {/* ESTADÍSTICAS */}
      {/* ====================================================== */}

      <section className="
        border-y
        border-gray-100
        bg-slate-50
      ">

        <div className="
          container
          mx-auto
          px-6
          py-10
          md:py-12
        ">

          <div className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-6
            max-w-6xl
            mx-auto
          ">


            {/* ESTADÍSTICA 1 */}

            <div className="
              flex
              items-center
              gap-5
              p-6
              md:p-7
              rounded-2xl
              border
              border-gray-100
              bg-white
              shadow-sm
              hover:shadow-md
              transition-shadow
            ">

              <div className="
                w-14
                h-14
                flex-shrink-0
                bg-green-50
                rounded-2xl
                flex
                items-center
                justify-center
              ">

                <CheckCircle className="
                  w-7
                  h-7
                  text-green-600
                " />

              </div>


              <div>

                <p className="
                  text-3xl
                  font-bold
                  text-gray-900
                  leading-none
                  mb-2
                ">
                  12,847
                </p>

                <p className="
                  text-sm
                  font-semibold
                  text-gray-900
                ">
                  Reportes resueltos
                </p>

                <p className="
                  text-xs
                  text-gray-400
                  mt-1
                ">
                  en los últimos 12 meses
                </p>

              </div>

            </div>


            {/* ESTADÍSTICA 2 */}

            <div className="
              flex
              items-center
              gap-5
              p-6
              md:p-7
              rounded-2xl
              border
              border-gray-100
              bg-white
              shadow-sm
              hover:shadow-md
              transition-shadow
            ">

              <div className="
                w-14
                h-14
                flex-shrink-0
                bg-blue-50
                rounded-2xl
                flex
                items-center
                justify-center
              ">

                <Clock className="
                  w-7
                  h-7
                  text-blue-600
                " />

              </div>


              <div>

                <p className="
                  text-3xl
                  font-bold
                  text-gray-900
                  leading-none
                  mb-2
                ">
                  1,203
                </p>

                <p className="
                  text-sm
                  font-semibold
                  text-gray-900
                ">
                  Reportes activos
                </p>

                <p className="
                  text-xs
                  text-gray-400
                  mt-1
                ">
                  en proceso ahora mismo
                </p>

              </div>

            </div>


            {/* ESTADÍSTICA 3 */}

            <div className="
              flex
              items-center
              gap-5
              p-6
              md:p-7
              rounded-2xl
              border
              border-gray-100
              bg-white
              shadow-sm
              hover:shadow-md
              transition-shadow
            ">

              <div className="
                w-14
                h-14
                flex-shrink-0
                bg-indigo-50
                rounded-2xl
                flex
                items-center
                justify-center
              ">

                <RefreshCw className="
                  w-7
                  h-7
                  text-indigo-600
                " />

              </div>


              <div>

                <p className="
                  text-3xl
                  font-bold
                  text-gray-900
                  leading-none
                  mb-2
                ">
                  3.2 días
                </p>

                <p className="
                  text-sm
                  font-semibold
                  text-gray-900
                ">
                  Tiempo promedio
                </p>

                <p className="
                  text-xs
                  text-gray-400
                  mt-1
                ">
                  de resolución por reporte
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ====================================================== */}
      {/* ÁREAS DE SERVICIO */}
      {/* ====================================================== */}

      <section className="
        container
        mx-auto
        px-6
        py-16
      ">


        {/* TÍTULO */}

        <div className="mb-10">

          <div className="
            flex
            items-center
            gap-2
            mb-2
          ">

            <div className="
              w-1
              h-5
              bg-indigo-600
              rounded-full
            " />

            <span className="
              text-xs
              font-semibold
              text-indigo-600
              uppercase
              tracking-wide
            ">
              Áreas de servicio
            </span>

          </div>


          <h2 className="
            text-3xl
            font-bold
            text-gray-900
            mb-2
          ">
            ¿Qué tipo de problema quieres reportar?
          </h2>


          <p className="
            text-gray-500
            max-w-lg
          ">
            Selecciona el área y te guiaremos para crear tu
            reporte de forma rápida y eficaz.
          </p>

        </div>


        {/* CARDS */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
        ">


          {/* AGUA */}

          <div className="
            bg-white
            rounded-2xl
            border
            border-gray-200
            p-6
            hover:shadow-lg
            hover:-translate-y-0.5
            transition-all
          ">

            <div className="
              flex
              items-center
              justify-between
              mb-4
            ">

              <div className="
                w-10
                h-10
                bg-blue-50
                rounded-xl
                flex
                items-center
                justify-center
              ">

                <Droplets className="
                  w-5
                  h-5
                  text-blue-600
                " />

              </div>


              <span className="
                text-xs
                font-medium
                text-blue-600
              ">
                214 reportes activos
              </span>

            </div>


            <h3 className="
              text-lg
              font-bold
              text-gray-900
              mb-2
            ">
              Agua y Drenaje
            </h3>


            <p className="
              text-sm
              text-gray-500
              mb-4
            ">
              Fugas, cortes de servicio, presión baja,
              drenaje tapado o contaminación del suministro.
            </p>


            <div className="
              flex
              flex-wrap
              gap-1.5
              mb-5
            ">

              <span className="
                px-2.5
                py-1
                text-xs
                bg-gray-50
                border
                border-gray-200
                rounded-lg
                text-gray-600
              ">
                Fuga en calle
              </span>

              <span className="
                px-2.5
                py-1
                text-xs
                bg-gray-50
                border
                border-gray-200
                rounded-lg
                text-gray-600
              ">
                Sin agua en colonia
              </span>

              <span className="
                px-2.5
                py-1
                text-xs
                bg-gray-50
                border
                border-gray-200
                rounded-lg
                text-gray-600
              ">
                Drenaje desbordado
              </span>

            </div>


            <Link
              to="/crear-reporte"
              className="
                flex
                items-center
                justify-center
                gap-2
                w-full
                py-2.5
                bg-blue-600
                hover:bg-blue-700
                text-white
                font-semibold
                text-sm
                rounded-lg
                transition-colors
              "
            >
              Reportar Agua

              <ArrowRight className="w-4 h-4" />

            </Link>

          </div>


          {/* ELECTRICIDAD */}

          <div className="
            bg-white
            rounded-2xl
            border
            border-gray-200
            p-6
            hover:shadow-lg
            hover:-translate-y-0.5
            transition-all
          ">

            <div className="
              flex
              items-center
              justify-between
              mb-4
            ">

              <div className="
                w-10
                h-10
                bg-amber-50
                rounded-xl
                flex
                items-center
                justify-center
              ">

                <Zap className="
                  w-5
                  h-5
                  text-amber-600
                " />

              </div>


              <span className="
                text-xs
                font-medium
                text-amber-600
              ">
                389 reportes activos
              </span>

            </div>


            <h3 className="
              text-lg
              font-bold
              text-gray-900
              mb-2
            ">
              Electricidad
            </h3>


            <p className="
              text-sm
              text-gray-500
              mb-4
            ">
              Alumbrado público fundido, postes caídos,
              cables colgantes o fallas en la red eléctrica.
            </p>


            <div className="
              flex
              flex-wrap
              gap-1.5
              mb-5
            ">

              <span className="
                px-2.5
                py-1
                text-xs
                bg-gray-50
                border
                border-gray-200
                rounded-lg
                text-gray-600
              ">
                Poste sin luz
              </span>

              <span className="
                px-2.5
                py-1
                text-xs
                bg-gray-50
                border
                border-gray-200
                rounded-lg
                text-gray-600
              ">
                Cable caído
              </span>

              <span className="
                px-2.5
                py-1
                text-xs
                bg-gray-50
                border
                border-gray-200
                rounded-lg
                text-gray-600
              ">
                Chispazo en transformador
              </span>

            </div>


            <Link
              to="/crear-reporte"
              className="
                flex
                items-center
                justify-center
                gap-2
                w-full
                py-2.5
                bg-amber-500
                hover:bg-amber-600
                text-white
                font-semibold
                text-sm
                rounded-lg
                transition-colors
              "
            >
              Reportar Electricidad

              <ArrowRight className="w-4 h-4" />

            </Link>

          </div>


          {/* SERVICIOS MUNICIPALES */}

          <div className="
            bg-white
            rounded-2xl
            border
            border-gray-200
            p-6
            hover:shadow-lg
            hover:-translate-y-0.5
            transition-all
          ">

            <div className="
              flex
              items-center
              justify-between
              mb-4
            ">

              <div className="
                w-10
                h-10
                bg-indigo-50
                rounded-xl
                flex
                items-center
                justify-center
              ">

                <Building2 className="
                  w-5
                  h-5
                  text-indigo-600
                " />

              </div>


              <span className="
                text-xs
                font-medium
                text-indigo-600
              ">
                600 reportes activos
              </span>

            </div>


            <h3 className="
              text-lg
              font-bold
              text-gray-900
              mb-2
            ">
              Servicios Municipales
            </h3>


            <p className="
              text-sm
              text-gray-500
              mb-4
            ">
              Baches, recolección de basura, parques
              deteriorados, señales viales o banquetas dañadas.
            </p>


            <div className="
              flex
              flex-wrap
              gap-1.5
              mb-5
            ">

              <span className="
                px-2.5
                py-1
                text-xs
                bg-gray-50
                border
                border-gray-200
                rounded-lg
                text-gray-600
              ">
                Bache peligroso
              </span>

              <span className="
                px-2.5
                py-1
                text-xs
                bg-gray-50
                border
                border-gray-200
                rounded-lg
                text-gray-600
              ">
                Sin recolección
              </span>

              <span className="
                px-2.5
                py-1
                text-xs
                bg-gray-50
                border
                border-gray-200
                rounded-lg
                text-gray-600
              ">
                Parque vandalizado
              </span>

            </div>


            <Link
              to="/crear-reporte"
              className="
                flex
                items-center
                justify-center
                gap-2
                w-full
                py-2.5
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                font-semibold
                text-sm
                rounded-lg
                transition-colors
              "
            >
              Reportar Servicios

              <ArrowRight className="w-4 h-4" />

            </Link>

          </div>

        </div>

      </section>


      {/* ============================================================
          SECCIÓN: CÓMO FUNCIONA LA PLATAFORMA
      ============================================================ */}
      <section className="bg-[#f5f7ff] border-y border-gray-100">
        <div className="container mx-auto px-6">

          {/* Encabezado */}
          <div className="text-center pt-16 md:pt-20">

            {/* Etiqueta */}
            <p className="text-xs md:text-sm font-mono tracking-widest text-indigo-600 uppercase">
              Proceso
            </p>

            {/* Título */}
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-[#10152f]">
              Cómo funciona la plataforma
            </h2>

          </div>


          {/* ========================================================
              PASOS
          ======================================================== */}
          <div className="max-w-6xl mx-auto pt-14 pb-20">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">

              {/* ====================================================
                  PASO 01
              ==================================================== */}
              <div className="relative">

                {/* Icono + número */}
                <div className="flex items-center gap-3">

                  {/* Icono */}
                  <div className="
                    w-11
                    h-11
                    rounded-xl
                    border
                    border-indigo-200
                    bg-indigo-50
                    flex
                    items-center
                    justify-center
                  ">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>

                  {/* Número */}
                  <span className="
                    text-sm
                    font-mono
                    font-medium
                    text-indigo-600
                  ">
                    01
                  </span>

                </div>


                {/* Contenido */}
                <div className="mt-6">

                  <h3 className="
                    text-lg
                    font-bold
                    text-[#10152f]
                  ">
                    Crea tu reporte
                  </h3>

                  <p className="
                    mt-3
                    text-sm
                    md:text-base
                    leading-7
                    text-gray-500
                    max-w-sm
                  ">
                    Describe el problema, sube fotos y señala la ubicación
                    exacta en el mapa.
                  </p>

                </div>

              </div>


              {/* ====================================================
                  PASO 02
              ==================================================== */}
              <div className="relative">

                {/* Icono + número */}
                <div className="flex items-center gap-3">

                  {/* Icono */}
                  <div className="
                    w-11
                    h-11
                    rounded-xl
                    border
                    border-indigo-200
                    bg-indigo-50
                    flex
                    items-center
                    justify-center
                  ">
                    <RefreshCw className="w-5 h-5 text-indigo-600" />
                  </div>

                  {/* Número */}
                  <span className="
                    text-sm
                    font-mono
                    font-medium
                    text-indigo-600
                  ">
                    02
                  </span>

                </div>


                {/* Contenido */}
                <div className="mt-6">

                  <h3 className="
                    text-lg
                    font-bold
                    text-[#10152f]
                  ">
                    Seguimiento en tiempo real
                  </h3>

                  <p className="
                    mt-3
                    text-sm
                    md:text-base
                    leading-7
                    text-gray-500
                    max-w-sm
                  ">
                    Consulta el estatus de tu reporte en cualquier momento
                    con tu folio ciudadano.
                  </p>

                </div>

              </div>


              {/* ====================================================
                  PASO 03
              ==================================================== */}
              <div className="relative">

                {/* Icono + número */}
                <div className="flex items-center gap-3">

                  {/* Icono */}
                  <div className="
                    w-11
                    h-11
                    rounded-xl
                    border
                    border-indigo-200
                    bg-indigo-50
                    flex
                    items-center
                    justify-center
                  ">
                    <CircleCheck className="w-5 h-5 text-indigo-600" />
                  </div>

                  {/* Número */}
                  <span className="
                    text-sm
                    font-mono
                    font-medium
                    text-indigo-600
                  ">
                    03
                  </span>

                </div>


                {/* Contenido */}
                <div className="mt-6">

                  <h3 className="
                    text-lg
                    font-bold
                    text-[#10152f]
                  ">
                    Problema resuelto
                  </h3>

                  <p className="
                    mt-3
                    text-sm
                    md:text-base
                    leading-7
                    text-gray-500
                    max-w-sm
                  ">
                    Una vez resuelto, confirma la solución y califica
                    la atención recibida.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ====================================================== */}
      {/* ÚLTIMOS REPORTES */}
      {/* ====================================================== */}

      {reportesRecientes.length > 0 && (

        <section className="
          container
          mx-auto
          px-6
          py-16
        ">


          {/* HEADER */}

          <div className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-6
          ">

            <div>

              <span className="
                text-xs
                font-semibold
                text-indigo-600
                uppercase
                tracking-wide
              ">
                Actividad reciente
              </span>


              <h3 className="
                text-xl
                font-bold
                text-gray-900
                mt-1
              ">
                Últimos reportes ciudadanos
              </h3>

            </div>


            <Link
              to="/mis-reportes"
              className="
                text-sm
                font-semibold
                text-indigo-600
                hover:text-indigo-700
                flex
                items-center
                gap-1
              "
            >
              Ver todos los reportes

              <ArrowRight className="w-4 h-4" />

            </Link>

          </div>


          {/* TABLA */}

          <div className="
            bg-white
            rounded-xl
            border
            border-gray-200
            overflow-x-auto
          ">

            <table className="w-full">

              <thead className="
                bg-gray-50
                border-b
                border-gray-200
              ">

                <tr>

                  <th className="
                    text-left
                    text-xs
                    font-semibold
                    text-gray-500
                    uppercase
                    tracking-wide
                    px-5
                    py-3
                  ">
                    Folio
                  </th>


                  <th className="
                    text-left
                    text-xs
                    font-semibold
                    text-gray-500
                    uppercase
                    tracking-wide
                    px-5
                    py-3
                  ">
                    Área
                  </th>


                  <th className="
                    text-left
                    text-xs
                    font-semibold
                    text-gray-500
                    uppercase
                    tracking-wide
                    px-5
                    py-3
                  ">
                    Colonia
                  </th>


                  <th className="
                    text-left
                    text-xs
                    font-semibold
                    text-gray-500
                    uppercase
                    tracking-wide
                    px-5
                    py-3
                  ">
                    Estatus
                  </th>


                  <th className="
                    text-left
                    text-xs
                    font-semibold
                    text-gray-500
                    uppercase
                    tracking-wide
                    px-5
                    py-3
                  ">
                    Tiempo
                  </th>

                </tr>

              </thead>


              <tbody className="
                divide-y
                divide-gray-100
              ">

                {reportesRecientes.map((r) => (

                  <tr
                    key={r.id}
                    className="
                      hover:bg-gray-50
                      transition-colors
                    "
                  >


                    <td className="
                      px-5
                      py-3.5
                    ">

                      <span className="
                        text-sm
                        font-semibold
                        text-indigo-600
                      ">
                        {r.codigoSeguimiento}
                      </span>

                    </td>


                    <td className="
                      px-5
                      py-3.5
                      text-sm
                      text-gray-700
                    ">
                      {r.areaServicio}
                    </td>


                    <td className="
                      px-5
                      py-3.5
                      text-sm
                      text-gray-500
                    ">
                      {r.colonia || "No especificada"}
                    </td>


                    <td className="
                      px-5
                      py-3.5
                    ">

                      <span
                        className={`
                          inline-flex
                          px-2
                          py-0.5
                          text-xs
                          font-semibold
                          rounded-full

                          ${r.estado === "RESUELTO"
                            ? "text-green-700 bg-green-50"
                            : r.estado === "EN_PROCESO"
                              ? "text-blue-700 bg-blue-50"
                              : r.estado === "PENDIENTE"
                                ? "text-amber-700 bg-amber-50"
                                : "text-gray-700 bg-gray-50"
                          }
                        `}
                      >

                        {
                          r.estado === "EN_PROCESO"
                            ? "En proceso"
                            : r.estado === "PENDIENTE"
                              ? "Pendiente"
                              : r.estado === "RESUELTO"
                                ? "Resuelto"
                                : r.estado
                        }

                      </span>

                    </td>


                    <td className="
                      px-5
                      py-3.5
                      text-sm
                      text-gray-400
                    ">
                      {formatTimeAgo(r.createdAt)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      )}


      {/* ====================================================== */}
      {/* CTA */}
      {/* ====================================================== */}

      <section className="
        container
        mx-auto
        px-6
        pb-16
      ">

        <div className="
          bg-gradient-to-r
          from-indigo-700
          to-blue-700
          rounded-2xl
          px-8
          py-12
          md:px-14
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-6
        ">


          <div className="text-white">

            <p className="
              text-xs
              font-medium
              text-blue-200
              uppercase
              tracking-wide
              mb-2
            ">
              ¿Tienes un problema que reportar?
            </p>


            <h3 className="
              text-2xl
              md:text-3xl
              font-bold
              mb-2
            ">
              Tu reporte hace la diferencia
            </h3>


            <p className="
              text-blue-200
              text-sm
              max-w-md
            ">
              En menos de 3 minutos puedes enviar un reporte
              con fotos, ubicación y descripción. La ciudad te escucha.
            </p>

          </div>


          <div className="
            flex
            flex-col
            sm:flex-row
            gap-3
          ">


            <Link
              to="/crear-reporte"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                bg-white
                text-indigo-700
                font-bold
                text-sm
                px-6
                py-3
                rounded-lg
                hover:bg-indigo-50
                transition-colors
              "
            >

              <FileText className="w-4 h-4" />

              Crear nuevo reporte

            </Link>


            <Link
              to="/mapa"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                border-2
                border-white/30
                text-white
                font-bold
                text-sm
                px-6
                py-3
                rounded-lg
                hover:bg-white/10
                transition-colors
              "
            >

              <MapPin className="w-4 h-4" />

              Ver mapa

            </Link>

          </div>

        </div>

      </section>


      {/* ====================================================== */}
      {/* FOOTER */}
      {/* ====================================================== */}

      <footer className="
        bg-gray-900
        text-white
        py-8
      ">

        <div className="
          container
          mx-auto
          px-6
        ">

          <div className="
            flex
            flex-col
            md:flex-row
            items-center
            justify-between
            gap-4
          ">


            {/* LOGO */}

            <div className="
              flex
              items-center
              gap-2.5
            ">

              <div className="
                w-7
                h-7
                bg-white/10
                rounded-lg
                flex
                items-center
                justify-center
              ">

                <MapPin className="
                  w-3.5
                  h-3.5
                " />

              </div>


              <span className="
                text-sm
                font-bold
              ">
                Reportes Ciudadanos
              </span>

            </div>


            {/* LINKS */}

            <div className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-6
              text-xs
              text-gray-400
            ">

              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Privacidad
              </a>


              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Términos de uso
              </a>


              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Contacto
              </a>


              <a
                href="#"
                className="hover:text-white transition-colors"
              >
                Accesibilidad
              </a>

            </div>


            {/* COPYRIGHT */}

            <p className="
              text-xs
              text-gray-500
            ">
              © 2025 Plataforma pública
            </p>

          </div>

        </div>

      </footer>


    </div>

  )

}