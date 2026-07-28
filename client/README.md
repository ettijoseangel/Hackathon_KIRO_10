# 🎨 Frontend - Reportes Ciudadanos

> Aplicación web React para reportes comunitarios con mapas interactivos y orientación institucional con IA.

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-cyan.svg)](https://tailwindcss.com/)

---

## 📖 Descripción

Este es el frontend de **Reportes Ciudadanos**, una aplicación web moderna construida con React 19, Vite y TypeScript. Proporciona una interfaz intuitiva y responsiva para que los ciudadanos reporten problemas comunitarios, consulten el estado de sus reportes mediante un código de seguimiento, y visualicen reportes en un mapa interactivo.

---

## 🚀 Stack Tecnológico

### Core
- **React 19.2** - Librería de UI con soporte para React Server Components
- **Vite 8.1** - Build tool con HMR (Hot Module Replacement) ultra-rápido
- **TypeScript 6.0** - Tipado estático para mayor seguridad y mantenibilidad
- **React Router DOM 7.11** - Enrutamiento del lado del cliente

### Estilos y UI
- **Tailwind CSS 4.3** - Framework CSS utility-first con modo mobile-first
- **shadcn/ui** - Componentes accesibles basados en Radix UI
- **Radix UI** - Primitivos de UI sin estilos, altamente accesibles
- **lucide-react** - Iconos modernos y optimizados
- **class-variance-authority (CVA)** - Manejo de variantes de componentes

### Mapas y Geolocalización
- **Leaflet 1.9** - Librería JavaScript para mapas interactivos
- **react-leaflet 5.0** - Componentes React para Leaflet
- **OpenStreetMap** - Tiles de mapas gratuitos (sin API key)
- **Nominatim** - Servicio de geocoding gratuito (OpenStreetMap)

### Testing
- **Vitest 4.1** - Framework de testing rápido basado en Vite
- **Testing Library** - Utilidades para testing de componentes React
- **jsdom** - Implementación de DOM para entorno Node.js
- **@testing-library/user-event** - Simulación de interacciones de usuario

### Desarrollo
- **ESLint 10** - Linter para JavaScript/TypeScript
- **PostCSS** - Procesador de CSS para Tailwind
- **Autoprefixer** - Prefijos CSS automáticos para compatibilidad

---

## 📁 Estructura del Proyecto

```
client/
├── public/                  # Assets estáticos
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # Componentes base de shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── select.tsx
│   │   └── Layout.tsx       # Layout principal con Navbar
│   │
│   ├── pages/               # Vistas completas (rutas)
│   │   ├── Landing.tsx      # Página de inicio
│   │   ├── ReportForm.tsx   # Formulario de creación de reportes
│   │   ├── MyReports.tsx    # Consulta de reportes por código
│   │   ├── ReportDetail.tsx # Detalle de un reporte específico
│   │   ├── MapaIncidencias.tsx # Mapa interactivo con todos los reportes
│   │   └── Ayuda.tsx        # Página de ayuda
│   │
│   ├── services/            # Comunicación HTTP con el backend
│   │   ├── apiClient.ts     # Cliente HTTP base (fetch wrapper)
│   │   ├── reporteService.ts # CRUD de reportes
│   │   └── orientacionService.ts # Servicio de orientación con IA
│   │
│   ├── types/               # Interfaces TypeScript
│   │   └── report.ts        # Tipos relacionados con reportes
│   │
│   ├── lib/                 # Utilidades
│   │   └── utils.ts         # Helper functions (cn, etc.)
│   │
│   ├── assets/              # Imágenes y recursos
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── test/                # Configuración de tests
│   │   └── setup.ts
│   │
│   ├── App.tsx              # Componente raíz de la aplicación
│   ├── App.css              # Estilos globales de la app
│   ├── main.tsx             # Punto de entrada de React
│   └── index.css            # Estilos globales y configuración Tailwind
│
├── index.html               # Plantilla HTML base
├── vite.config.ts           # Configuración de Vite
├── vitest.config.ts         # Configuración de Vitest
├── tailwind.config.js       # Configuración de Tailwind CSS
├── postcss.config.js        # Configuración de PostCSS
├── tsconfig.json            # Configuración de TypeScript
├── tsconfig.app.json        # Configuración TS para la app
├── tsconfig.node.json       # Configuración TS para Node (Vite)
├── eslint.config.js         # Configuración de ESLint
├── components.json          # Configuración de shadcn/ui
├── package.json             # Dependencias y scripts
└── README.md                # Este archivo
```

---

## 📋 Prerequisitos

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Git** para control de versiones

---

## ⚙️ Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd client
npm install
```

### 2. Variables de Entorno (Opcional)

Si necesitas personalizar la URL del backend, crea un archivo `.env` en la raíz del directorio `client/`:

```env
# URL del backend (por defecto usa el proxy de Vite en desarrollo)
VITE_API_URL=http://localhost:3001
```

> **Nota:** En desarrollo, Vite está configurado con un proxy automático para `/api`, por lo que no necesitas configurar `VITE_API_URL` a menos que el backend esté en un puerto diferente.

---

## 🎮 Comandos Disponibles

### Desarrollo

```bash
npm run dev
```
Inicia el servidor de desarrollo con HMR en `http://localhost:5173`

### Build para Producción

```bash
npm run build
```
Compila el proyecto para producción en la carpeta `dist/`:
1. Ejecuta el compilador de TypeScript (`tsc -b`)
2. Construye los assets optimizados con Vite

### Preview del Build

```bash
npm run preview
```
Sirve localmente el build de producción para verificar antes de desplegar

### Testing

```bash
# Ejecutar tests una vez
npm test

# Ejecutar tests en modo watch (recarga automática)
npm run test:watch
```

### Linting

```bash
npm run lint
```
Ejecuta ESLint para verificar la calidad del código

---

## 🗺️ Rutas de la Aplicación

| Ruta            | Componente          | Descripción                                    |
|-----------------|---------------------|------------------------------------------------|
| `/`             | `Landing.tsx`       | Página de inicio con call-to-action           |
| `/reportar`     | `ReportForm.tsx`    | Formulario de creación de reportes            |
| `/mis-reportes` | `MyReports.tsx`     | Búsqueda de reportes por código de seguimiento|
| `/reportes/:id` | `ReportDetail.tsx`  | Detalle completo de un reporte específico     |
| `/mapa`         | `MapaIncidencias.tsx`| Mapa interactivo con todos los reportes       |
| `/ayuda`        | `Ayuda.tsx`         | Página de ayuda e información                 |

---

## 🎨 Sistema de Diseño

### Paleta de Colores (Variante B)

```css
/* Colores Primarios */
--primary: #6366F1        /* Índigo/Violeta */
--primary-dark: #4F46E5   /* Índigo oscuro */

/* Colores de Fondo */
--background: slate-50    /* Fondo principal */
--card: white             /* Fondo de cards */

/* Colores de Texto */
--foreground: slate-900   /* Texto principal */
--muted: slate-600        /* Texto secundario */
```

### Componentes de UI

#### Buttons
- **Variantes**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **Tamaños**: `default`, `sm`, `lg`, `icon`
- Gradientes personalizados según función:
  - GPS: Verde (`from-green-500 to-green-600`)
  - Archivo: Morado (`from-purple-500 to-purple-600`)
  - Eliminar: Rojo (`from-red-500 to-red-600`)

#### Cards
- Bordes redondeados: `rounded-xl`
- Sombras suaves: `shadow-sm` o `shadow-md`
- Padding consistente: `p-6` o `p-8`

#### Typography
- Fuente: Sans-serif del sistema
- Jerarquía clara con Tailwind: `text-4xl`, `text-xl`, `text-base`, `text-sm`
- Pesos: `font-bold`, `font-semibold`, `font-medium`, `font-normal`

### Diseño Responsivo (Mobile-First)

Todos los componentes están diseñados con enfoque mobile-first:

```jsx
// Ejemplo de diseño responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Contenido */}
</div>
```

Breakpoints de Tailwind:
- `sm`: 640px (móvil grande)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (desktop grande)

---

## 🧩 Componentes Principales

### Layout

Componente que envuelve todas las páginas, incluye:
- **Navbar**: Logo, navegación, botón CTA
- **Footer**: Información adicional
- **Outlet**: Renderiza el contenido de la ruta actual

```tsx
import Layout from '@/components/Layout'

// Usado en App.tsx con React Router
<Route element={<Layout />}>
  <Route path="/" element={<Landing />} />
  {/* ... más rutas */}
</Route>
```

### ReportForm

Formulario completo de creación de reportes con:
- ✅ Captura de ubicación GPS automática (Geolocation API)
- ✅ Búsqueda de dirección con geocoding (Nominatim)
- ✅ Upload de foto (hasta 5MB)
- ✅ Preview de foto antes de enviar
- ✅ Validación en tiempo real
- ✅ Estados de carga y error
- ✅ Integración con backend (`reporteService`)

### MapaIncidencias

Mapa interactivo con Leaflet que muestra:
- 🗺️ Todos los reportes geolocalizados
- 📍 Markers con colores según prioridad:
  - 🔴 Alta: Rojo
  - 🟡 Media: Amarillo
  - 🟢 Baja: Verde
- 💬 Popups con información del reporte al hacer clic
- 🔍 Controles de zoom y navegación

### MyReports

Búsqueda y consulta de reportes mediante código de seguimiento:
- 🔍 Input para código (formato: REP-XXX)
- 📋 Visualización de resultados
- 🔗 Link al detalle completo del reporte

### ReportDetail

Vista detallada de un reporte específico con:
- 📝 Título y descripción
- 🏷️ Categoría, área de servicio, prioridad
- 📍 Ubicación (mapa pequeño si tiene coordenadas)
- 🖼️ Foto adjunta (si existe)
- 📞 Información de contacto
- 📊 Estado actual y código de seguimiento
- 🤖 Botón para ver orientación con IA

---

## 🌍 Integración con Mapas

### Leaflet + OpenStreetMap

#### Instalación (ya incluida)

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

#### Configuración Básica

```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

<MapContainer center={[25.6866, -100.3161]} zoom={13}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap contributors'
  />
  <Marker position={[lat, lng]}>
    <Popup>Información del reporte</Popup>
  </Marker>
</MapContainer>
```

#### Geocoding con Nominatim

```typescript
// Búsqueda de coordenadas desde dirección
const geocodeAddress = async (address: string) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
    `format=json&q=${encodeURIComponent(address)}`
  )
  const data = await response.json()
  return data[0] // { lat, lon, display_name }
}
```

> **Nota:** Nominatim es gratuito pero tiene límite de 1 request/segundo. Para producción considera usar caché o un servicio de geocoding alternativo.

---

## 🔌 Integración con Backend

### Arquitectura de Servicios

Todo el código de comunicación HTTP está centralizado en `src/services/`:

#### `apiClient.ts` - Cliente HTTP Base

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function fetchAPI<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  
  return response.json()
}
```

#### `reporteService.ts` - CRUD de Reportes

```typescript
export const reporteService = {
  // Crear reporte
  async crearReporte(data: FormData): Promise<Reporte> {
    return fetchAPI('/reportes', {
      method: 'POST',
      body: data,
    })
  },

  // Listar reportes
  async listarReportes(filtros?: FiltrosReporte): Promise<Reporte[]> {
    const query = new URLSearchParams(filtros as any)
    return fetchAPI(`/reportes?${query}`)
  },

  // Buscar por código
  async buscarPorCodigo(codigo: string): Promise<Reporte> {
    return fetchAPI(`/reportes/${codigo}`)
  },

  // Obtener por ID
  async obtenerPorId(id: string): Promise<Reporte> {
    return fetchAPI(`/reportes/${id}`)
  },
}
```

#### `orientacionService.ts` - Guía con IA

```typescript
export const orientacionService = {
  async obtenerOrientacion(reporteId: string): Promise<OrientacionIA> {
    return fetchAPI(`/v1/reportes/${reporteId}/guia-ia`)
  },
}
```

### Reglas de Integración

✅ **HACER:**
- Centralizar toda lógica HTTP en `services/`
- Manejar 3 estados: `loading`, `data`, `error`
- Usar tipos TypeScript para las respuestas
- Mostrar mensajes de error amigables al usuario

❌ **NO HACER:**
- Poner URLs hardcodeadas en componentes
- Hacer `fetch` directo desde componentes
- Mezclar lógica de negocio con lógica de UI
- Exponer credenciales o service keys

---

## 🧪 Testing

### Estrategia de Testing

El proyecto usa **Example-Based Testing** con Vitest y Testing Library.

#### Estructura de Tests

```
src/
├── pages/
│   ├── ReportForm.tsx
│   └── ReportForm.test.tsx  ← Tests del formulario
└── components/
    └── ui/
        ├── button.tsx
        └── button.test.tsx  ← Tests del botón
```

#### Ejemplo de Test de Componente

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('renderiza correctamente', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('llama onClick cuando se hace clic', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Cobertura Objetivo

- ✅ **Componentes con lógica**: >80%
- ✅ **Servicios HTTP**: 100%
- ✅ **Utilidades**: 100%
- ⚠️ **Componentes de presentación pura**: Opcional

### Comandos de Testing

```bash
# Ejecutar tests una vez (CI)
npm test

# Modo watch (desarrollo)
npm run test:watch

# Con cobertura
npm run test:watch -- --coverage
```

---

## 🔒 Seguridad

### Prácticas Implementadas

✅ **Validación de Inputs**
- Validación en cliente (UX) antes de enviar al backend
- Validación en servidor como fuente de verdad
- Sanitización de datos antes de renderizar

✅ **Manejo de Secretos**
- Solo usar `anon key` de Supabase (si es necesario para Storage)
- **NUNCA** exponer `service_role key` en el frontend
- Variables de entorno con prefijo `VITE_` para exponer al cliente

✅ **CORS y API**
- El backend valida el origin permitido
- Comunicación solo a través de endpoints autorizados
- No se exponen stack traces al usuario

✅ **XSS Protection**
- React escapa automáticamente el contenido renderizado
- Usar `dangerouslySetInnerHTML` solo cuando sea estrictamente necesario

---

## 🛠️ Troubleshooting

### Problema: El servidor de desarrollo no inicia

**Solución:**
```bash
# Limpiar caché de Vite
rm -rf node_modules/.vite

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Problema: Error de compilación TypeScript

**Solución:**
```bash
# Verificar versión de TypeScript
npm list typescript

# Regenerar archivos de tipos
npm run build
```

### Problema: El mapa no se renderiza correctamente

**Solución:**
- Asegúrate de importar los estilos de Leaflet:
  ```tsx
  import 'leaflet/dist/leaflet.css'
  ```
- Verifica que el contenedor del mapa tenga altura definida:
  ```css
  .map-container {
    height: 500px;
  }
  ```

### Problema: No se pueden cargar imágenes

**Solución:**
- Verifica que las imágenes estén en `public/` o `src/assets/`
- Para `public/`: usa ruta absoluta `/imagen.png`
- Para `src/assets/`: importa la imagen:
  ```tsx
  import logo from './assets/logo.png'
  ```

### Problema: Error de CORS al hacer peticiones

**Solución:**
- En desarrollo: Verifica que el proxy de Vite esté configurado en `vite.config.ts`
- En producción: Verifica que el backend permita el origin del frontend en `CLIENT_ORIGIN`

---

## 📐 Convenciones de Código

### Nomenclatura

- **Componentes**: PascalCase (`ReportForm.tsx`)
- **Archivos de utilidades**: camelCase (`apiClient.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces**: PascalCase con prefijo `I` opcional (`IReporte` o `Reporte`)

### Estructura de Componentes

```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Interfaces/Types
interface MiComponenteProps {
  title: string
  onSubmit: () => void
}

// 3. Componente
export function MiComponente({ title, onSubmit }: MiComponenteProps) {
  // 3.1. State y hooks
  const [isLoading, setIsLoading] = useState(false)

  // 3.2. Funciones auxiliares
  const handleClick = () => {
    setIsLoading(true)
    onSubmit()
  }

  // 3.3. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Enviar'}
      </Button>
    </div>
  )
}
```

### Uso de Tailwind

```tsx
// ✅ Bueno: clases organizadas, legibles
<div className="flex flex-col gap-4 p-6 bg-white rounded-xl shadow-md">

// ❌ Evitar: clases desordenadas, difíciles de leer
<div className="p-6 shadow-md flex bg-white gap-4 rounded-xl flex-col">

// ✅ Mejor: usar cn() para condicionales
import { cn } from '@/lib/utils'

<button className={cn(
  "px-4 py-2 rounded-lg",
  isActive && "bg-primary text-white",
  !isActive && "bg-gray-200 text-gray-700"
)}>
```

---

## 🤝 Contribución

### Flujo de Trabajo

1. **Leer el código existente** antes de hacer cambios
2. **Planificar** qué se va a modificar
3. **Implementar** el cambio mínimo necesario
4. **Verificar** que compila y se visualiza correctamente
5. **Commit atómico** siguiendo Conventional Commits

### Commits

Usar formato [Conventional Commits](https://www.conventionalcommits.org/) en español:

```bash
feat: agregar componente de notificaciones
fix: corregir validación de formulario de reportes
refactor: extraer lógica de mapas a custom hook
style: ajustar espaciado en landing page
test: agregar tests para ReportForm
docs: actualizar README con nuevas rutas
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [React 19 Docs](https://react.dev/)
- [Vite Docs](https://vite.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Leaflet Docs](https://leafletjs.com/)
- [React Leaflet Docs](https://react-leaflet.js.org/)

### Specs del Proyecto

- [Requirements](../.kiro/specs/reportes/requirements.md) - Requerimientos funcionales (EARS)
- [Design](../.kiro/specs/reportes/design.md) - Diseño técnico del frontend
- [Tasks](../.kiro/specs/reportes/tasks.md) - Plan de implementación

### Reglas de Trabajo

- [Frontend Rules](../.kiro/steering/frontend-rules.md) - Reglas específicas del frontend
- [Workflow](../.kiro/steering/workflow.md) - Reglas generales de commits y workflow

---

## 📄 Licencia

Este proyecto forma parte del Hackathon Kiro by Código Facilito: **Reto 2. Aplicaciones Web**.

---

**Construido con ❤️ usando React, Vite y Tailwind CSS**
