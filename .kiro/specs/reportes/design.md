# Design Document

## Overview
Diseño técnico de la aplicación frontend de Reportes Ciudadanos construida con React, Vite, Tailwind CSS y shadcn/ui. La aplicación se divide en dos áreas principales: vista pública para ciudadanos y dashboard administrativo.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
│                     (React Router)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌─────────────────────┐  │
│  │  Public Routes   │         │  Admin Routes       │  │
│  │                  │         │  (URL only)         │  │
│  │  - /            │         │  - /dashboard       │  │
│  │  - /mis-reportes│         │                     │  │
│  └──────────────────┘         └─────────────────────┘  │
│                                                          │
│  ┌──────────────────┐         ┌─────────────────────┐  │
│  │  Components      │         │  UI Library         │  │
│  │  - Layout        │         │  - shadcn/ui        │  │
│  │  - ReportForm    │         │  - Tailwind CSS     │  │
│  │  - MyReports     │         │  - lucide-react     │  │
│  │  - Dashboard     │         │                     │  │
│  └──────────────────┘         └─────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Requests
                          ▼
                ┌──────────────────────┐
                │   Backend API        │
                │   (To be developed)  │
                └──────────────────────┘
```

### Component Structure

```
src/
├── App.tsx                 # Configuración de rutas
├── main.tsx               # Entry point
├── index.css              # Estilos globales y variables CSS
│
├── components/
│   ├── Layout.tsx         # Layout principal con navegación
│   └── ui/                # Componentes shadcn/ui
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── card.tsx
│       └── label.tsx
│
├── pages/
│   ├── ReportForm.tsx     # Formulario de creación de reportes
│   ├── MyReports.tsx      # Consulta de reportes por código
│   └── Dashboard.tsx      # Dashboard administrativo
│
├── types/
│   └── report.ts          # Definiciones de tipos TypeScript
│
└── data/
    └── mockReports.ts     # Datos mock para desarrollo
```

## Components and Interfaces

### Core Components

#### Layout Component
**Propósito:** Proporcionar estructura de navegación compartida para todas las páginas.

**Props:**
```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

**Interfaz Pública:**
- Renderiza navegación con links activos/inactivos
- Provee outlet para contenido de páginas hijas
- Mantiene consistencia visual en toda la aplicación

#### ReportForm Component
**Propósito:** Formulario de creación de reportes para ciudadanos.

**Props:** Ninguna (página standalone)

**Interfaz Pública:**
- Maneja validación de campos obligatorios
- Gestiona captura de ubicación (GPS/manual)
- Procesa carga y preview de imágenes
- Emite petición POST para crear reporte
- Muestra modal con código de seguimiento

**Eventos:**
- `onSubmit`: Envía datos al backend
- `onLocationCapture`: Captura coordenadas GPS
- `onImageUpload`: Procesa archivo de imagen

#### MyReports Component
**Propósito:** Consulta de reportes por código de seguimiento.

**Props:** Ninguna (página standalone)

**Interfaz Pública:**
- Acepta código de seguimiento como input
- Realiza búsqueda GET al backend
- Muestra detalles del reporte encontrado
- Renderiza estados con íconos y colores distintivos

**Eventos:**
- `onSearch`: Busca reporte por código

#### Dashboard Component
**Propósito:** Vista administrativa para gestión de reportes.

**Props:** Ninguna (página standalone)

**Interfaz Pública:**
- Lista todos los reportes en tabla
- Filtra por prioridad y categoría
- Permite cambio de estado por reporte
- Muestra skeletons durante carga

**Eventos:**
- `onStatusChange`: Actualiza estado de reporte
- `onFilterChange`: Aplica filtros

### shadcn/ui Component Interfaces

#### Button Component
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}
```

#### Input Component
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

#### Select Component
```typescript
interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}
```

#### Card Component
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
```

### API Client Interface

```typescript
interface ReportCreatePayload {
  titulo: string;
  descripcion: string;
  categoria: string;
  ubicacion: Location;
  evidencia?: string | File;
}

interface ReportCreateResponse {
  success: boolean;
  codigo: string;
}

interface ReportUpdatePayload {
  estado: ReportStatus;
}

interface ReportUpdateResponse {
  success: boolean;
}

// API Client Methods
const ApiClient = {
  createReport: (payload: ReportCreatePayload) => Promise<ReportCreateResponse>,
  getReportByCode: (codigo: string) => Promise<Report>,
  getAllReports: (filters?: { prioridad?: string, categoria?: string }) => Promise<Report[]>,
  updateReportStatus: (id: string, payload: ReportUpdatePayload) => Promise<ReportUpdateResponse>
}
```

## Data Models

### Report Type
```typescript
interface Location {
  lat?: number;
  lng?: number;
  address?: string;
}

type ReportStatus = 
  | "Pendiente" 
  | "En Revisión" 
  | "En Progreso" 
  | "Resuelto" 
  | "Rechazado";

type ReportPriority = "Alta" | "Media" | "Baja";

interface Report {
  id: string;                    // Código de seguimiento (REP-XXX)
  titulo: string;
  descripcion: string;
  categoria: string;
  prioridad: ReportPriority;
  estado: ReportStatus;
  fechaCreacion: Date;
  ubicacion: Location;
  evidencia?: string;            // URL o base64 de imagen
}
```

## Page Designs

### 1. ReportForm Page (/)

**Purpose:** Página pública para que ciudadanos creen reportes.

**Components:**
- Header con gradiente azul-índigo
- Card: Información del Reporte
  - Input: Título (obligatorio)
  - Textarea: Descripción (obligatorio)
  - Select: Categoría (obligatorio)
- Card: Ubicación del Problema
  - Button: Captura GPS (verde)
  - Input: Dirección manual
  - Display: Coordenadas/dirección capturada
- Card: Evidencia Visual
  - Button: Cargar archivo (morado)
  - Button: Capturar con cámara (rosa) - condicional
  - Preview de imagen con botón eliminar (rojo)
- Button: Enviar Reporte (azul, grande)
- Modal: Código de seguimiento (aparece después de envío exitoso)

**State Management:**
```typescript
// Formulario
const [title, setTitle] = useState("")
const [description, setDescription] = useState("")
const [category, setCategory] = useState("")

// Ubicación
const [location, setLocation] = useState<Location | null>(null)
const [manualAddress, setManualAddress] = useState("")
const [locationType, setLocationType] = useState<"gps" | "manual" | null>(null)

// Imagen
const [imageFile, setImageFile] = useState<File | null>(null)
const [imagePreview, setImagePreview] = useState<string | null>(null)

// Validación y estados
const [validationErrors, setValidationErrors] = useState({})
const [isSubmitting, setIsSubmitting] = useState(false)
const [submittedCode, setSubmittedCode] = useState<string | null>(null)
```

**HTTP Interactions:**
- POST `/api/reportes` - Crear nuevo reporte
  - Request: FormData con todos los campos
  - Response: `{ success: true, codigo: "REP-123" }`

### 2. MyReports Page (/mis-reportes)

**Purpose:** Página pública para que ciudadanos consulten sus reportes.

**Components:**
- Header con gradiente azul-índigo
- Card: Formulario de búsqueda
  - Input: Código de seguimiento
  - Button: Buscar (azul)
- Card: Resultado (condicional)
  - Badge: Estado con ícono y color
  - Grid: Detalles del reporte
  - Section: Descripción del estado actual
- Card: Información (cuando no hay búsqueda)

**State Management:**
```typescript
const [searchCode, setSearchCode] = useState("")
const [report, setReport] = useState<Report | null>(null)
const [searching, setSearching] = useState(false)
const [error, setError] = useState<string | null>(null)
```

**HTTP Interactions:**
- GET `/api/reportes/:codigo` - Consultar reporte
  - Request: código en URL
  - Response: Report object o 404

**Status Visualization:**
```typescript
const statusConfig = {
  "Pendiente": {
    icon: Clock,
    color: "bg-gray-100 text-gray-800 border-gray-300",
    message: "Tu reporte está en espera de revisión"
  },
  "En Revisión": {
    icon: Eye,
    color: "bg-blue-100 text-blue-800 border-blue-300",
    message: "Tu reporte está siendo evaluado"
  },
  "En Progreso": {
    icon: AlertCircle,
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    message: "Las autoridades están trabajando en resolver tu reporte"
  },
  "Resuelto": {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-300",
    message: "¡Tu reporte ha sido resuelto exitosamente!"
  },
  "Rechazado": {
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-300",
    message: "Tu reporte fue rechazado"
  }
}
```

### 3. Dashboard Page (/dashboard)

**Purpose:** Dashboard administrativo para gestión de reportes (solo URL directa).

**Components:**
- Header con gradiente azul-índigo
- Card: Filtros
  - Select: Prioridad (con fondo sólido blanco)
  - Select: Categoría (con fondo sólido blanco)
- Table: Lista de reportes
  - Columnas: ID, Título, Categoría, Prioridad, Estado, Fecha, Ubicación
  - Dropdown: Cambio de estado por fila
  - Skeleton rows durante carga
- Footer: Contador de reportes

**State Management:**
```typescript
const [reports, setReports] = useState<Report[]>([])
const [priorityFilter, setPriorityFilter] = useState("all")
const [categoryFilter, setCategoryFilter] = useState("all")
const [isLoadingReports, setIsLoadingReports] = useState(true)
const [updatingReportId, setUpdatingReportId] = useState<string | null>(null)
```

**HTTP Interactions:**
- GET `/api/reportes` - Obtener todos los reportes
  - Response: `Report[]`
- PATCH `/api/reportes/:id/estado` - Actualizar estado
  - Request: `{ estado: ReportStatus }`
  - Response: `{ success: true }`

### 4. Layout Component

**Purpose:** Layout compartido con navegación.

**Navigation Menu:**
- Logo con ícono
- Título y subtítulo
- Links de navegación:
  - "Crear Reporte" (/) - visible
  - "Mis Reportes" (/mis-reportes) - visible
  - Dashboard (/dashboard) - NO visible, solo accesible por URL

**Active State:**
- Link activo: fondo blanco, texto azul
- Link inactivo: fondo azul oscuro, texto blanco

## Styling System

### Color Palette (CSS Variables)
```css
:root {
  --color-background: 210 40% 96%;
  --color-foreground: 222 47% 11%;
  --color-primary: 217 91% 48%;        /* Azul vibrante */
  --color-primary-foreground: 0 0% 100%;
  --color-secondary: 210 40% 92%;
  --color-muted: 210 40% 92%;
  --color-accent: 217 91% 92%;
  --color-destructive: 0 84% 60%;
  --color-border: 214 32% 82%;
  --color-input: 214 32% 88%;
  --radius: 0.75rem;
}
```

### Component Styling Standards

**Headers:**
- `bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700`
- `border-4 border-indigo-800`
- `rounded-2xl`
- `shadow-2xl`

**Cards:**
- `bg-white`
- `border-2 border-blue-100`
- `shadow-xl`
- `rounded-2xl`

**Card Headers:**
- `bg-gradient-to-r from-blue-50 to-indigo-50`
- `border-b-2 border-blue-200`

**Buttons:**
- GPS: `bg-gradient-to-r from-green-500 to-emerald-600`
- Archivo: `bg-gradient-to-r from-purple-500 to-indigo-600`
- Cámara: `bg-gradient-to-r from-pink-500 to-rose-600`
- Eliminar: `bg-gradient-to-r from-red-500 to-red-600`
- Principal: `bg-gradient-to-r from-blue-600 to-indigo-700`
- Altura: `h-12`
- Bordes: `border-2`
- Sombras: `shadow-lg`

**Selects:**
- `bg-white` (fondo sólido)
- `border-2 border-gray-300`
- `hover:border-blue-400`
- `focus:ring-blue-500`
- `rounded-lg`
- Dropdown: `bg-white shadow-2xl border-2`

**Inputs:**
- `border-2 border-gray-300`
- `focus:border-blue-500`
- `rounded-lg`
- `h-12` para altura estándar

## API Integration Points

### Endpoints (To be implemented by backend)

```
POST   /api/reportes
       Body: { titulo, descripcion, categoria, ubicacion, evidencia? }
       Response: { success: boolean, codigo: string }

GET    /api/reportes/:codigo
       Response: Report object

GET    /api/reportes
       Query: ?prioridad=&categoria=
       Response: Report[]

PATCH  /api/reportes/:id/estado
       Body: { estado: ReportStatus }
       Response: { success: boolean }
```

### Mock Data Strategy
Durante desarrollo, usar datos mock en:
- `src/data/mockReports.ts` - Reportes de ejemplo
- Simular delays con `setTimeout` para operaciones async
- Generar códigos aleatorios: `REP-${Math.random()}`

## Error Handling

### Client-Side Validation Errors

**Validación de Formulario (ReportForm):**
```typescript
interface ValidationErrors {
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  ubicacion?: string;
}

// Ejemplo de mensajes de error
const validationMessages = {
  titulo: "El título es obligatorio",
  descripcion: "La descripción es obligatoria",
  categoria: "Debes seleccionar una categoría",
  ubicacion: "Debes proporcionar una ubicación (GPS o dirección manual)"
}
```

**Estrategia:**
- Validación en tiempo real cuando el usuario corrige campos
- Mensajes de error específicos mostrados debajo de cada campo
- Bloqueo del botón de envío hasta que todos los campos sean válidos

**Validación de Archivos:**
```typescript
// Validación de tipo de archivo
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Solo se permiten archivos JPG, PNG o WEBP');
}

// Validación de tamaño
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  throw new Error('El archivo no puede superar 5MB');
}
```

### HTTP Error Handling

**Estrategia General:**
```typescript
async function handleHttpRequest<T>(request: Promise<Response>): Promise<T> {
  try {
    const response = await request;
    
    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Datos inválidos. Verifica la información enviada.');
        case 404:
          throw new Error('Reporte no encontrado. Verifica el código de seguimiento.');
        case 500:
          throw new Error('Error del servidor. Intenta nuevamente más tarde.');
        default:
          throw new Error(`Error inesperado: ${response.status}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Error de red. Verifica tu conexión a internet.');
    }
    throw error;
  }
}
```

**Errores por Componente:**

**ReportForm:**
- POST falla → Mostrar mensaje de error en modal, mantener datos del formulario
- Network error → "No se pudo conectar con el servidor. Verifica tu conexión."
- Timeout → "La operación tomó demasiado tiempo. Intenta nuevamente."

**MyReports:**
- GET 404 → "No se encontró ningún reporte con el código ingresado"
- GET 500 → "Error al buscar el reporte. Intenta nuevamente más tarde"
- Network error → "Error de conexión. Verifica tu internet"

**Dashboard:**
- GET falla al cargar reportes → Mostrar mensaje de error en lugar de tabla
- PATCH falla al actualizar estado → Revertir cambio visual, mostrar notificación de error
- Network error → Mostrar banner persistente con botón de reintentar

### Geolocation API Errors

```typescript
function handleGeolocationError(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Permiso de ubicación denegado. Por favor permite el acceso a tu ubicación o ingresa la dirección manualmente.";
    case error.POSITION_UNAVAILABLE:
      return "No se pudo obtener tu ubicación. Intenta ingresar la dirección manualmente.";
    case error.TIMEOUT:
      return "Se agotó el tiempo para obtener tu ubicación. Intenta nuevamente o ingresa la dirección manualmente.";
    default:
      return "Error al obtener ubicación. Ingresa la dirección manualmente.";
  }
}
```

### Camera API Errors

```typescript
async function handleCameraAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Permiso de cámara denegado. Usa la opción de cargar archivo.');
    } else if (error.name === 'NotFoundError') {
      throw new Error('No se encontró una cámara en tu dispositivo.');
    } else {
      throw new Error('Error al acceder a la cámara. Usa la opción de cargar archivo.');
    }
  }
}
```

### User-Facing Error Display

**Estrategia de UI:**
- Errores de validación → Texto rojo debajo del campo afectado
- Errores HTTP → Modal o notificación toast con mensaje claro y botón "Cerrar"
- Errores críticos (network) → Banner persistente con botón "Reintentar"
- Errores de permisos (GPS, Camera) → Mensaje informativo con alternativas

**Ejemplo de componente de error:**
```typescript
interface ErrorMessageProps {
  type: 'validation' | 'http' | 'permission';
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}
```

## Security Considerations

1. **Separación de Vistas**
   - Dashboard no aparece en navegación pública
   - Ciudadanos solo consultan sus propios reportes (por código)

2. **Validación Client-Side**
   - Tipos de archivo para imágenes
   - Tamaño máximo de archivos (5MB)
   - Campos obligatorios

3. **Future Enhancements**
   - Implementar autenticación para dashboard
   - Rate limiting para búsquedas
   - Sanitización de inputs

## Performance Considerations

1. **Code Splitting**
   - React Router con lazy loading por rutas

2. **Image Optimization**
   - Compresión de imágenes antes de enviar
   - Preview con thumbnails

3. **State Management**
   - Estado local con useState (suficiente para esta escala)
   - Sin necesidad de Redux/Zustand

4. **Loading States**
   - Skeleton screens para tabla
   - Spinners para operaciones async
   - Disabled states durante peticiones

## Testing Strategy

### Enfoque de Testing

**Para esta feature, Property-Based Testing (PBT) NO es apropiado** porque:
- La aplicación es principalmente **rendering de UI y componentes React**
- Las operaciones son **CRUD simple** sin lógica de transformación compleja
- No hay parsers, serializadores, o algoritmos que requieran validación de propiedades universales
- El comportamiento se valida mejor con **example-based tests y snapshot tests**

### Unit Tests

**Componentes a testear:**

1. **ReportForm Component**
   - Validación de campos obligatorios (título, descripción, categoría, ubicación)
   - Validación de tipo de archivo (solo imágenes: jpg, png, webp)
   - Validación de tamaño de archivo (máximo 5MB)
   - Estado del botón de envío (habilitado/deshabilitado según validación)
   - Generación de preview de imagen
   - Limpieza de formulario después de envío exitoso

2. **MyReports Component**
   - Rendering de estados con íconos y colores correctos
   - Manejo de código no encontrado (404)
   - Formato de fecha de creación
   - Display condicional de ubicación (GPS vs dirección manual)

3. **Dashboard Component**
   - Filtrado por prioridad y categoría
   - Ordenamiento por fecha (descendente)
   - Actualización optimista del estado en tabla
   - Contador de reportes

4. **Layout Component**
   - Links de navegación activos/inactivos
   - Visibilidad de opciones del menú

**Helpers y Utilities:**
```typescript
// Formateo de fechas
formatDate(date: Date) => string

// Validación de archivo
validateImageFile(file: File) => { valid: boolean, error?: string }

// Generación de preview
generateImagePreview(file: File) => Promise<string>
```

### Integration Tests

**Flujos completos a testear:**

1. **Flujo de Creación de Reporte**
   - Usuario completa formulario → POST al backend → Muestra código de seguimiento
   - Usuario intenta enviar sin completar campos → Muestra errores de validación
   - Usuario carga imagen inválida → Muestra error de tipo/tamaño

2. **Flujo de Búsqueda de Reporte**
   - Usuario ingresa código válido → GET al backend → Muestra detalles del reporte
   - Usuario ingresa código inválido → Muestra mensaje "Reporte no encontrado"

3. **Flujo de Actualización de Estado (Dashboard)**
   - Admin cambia estado de reporte → PATCH al backend → Actualiza tabla visualmente
   - PATCH falla → Revierte cambio visual y muestra error

### Snapshot Tests

**Componentes visuales:**
- Card de información de reporte (con diferentes estados)
- Badge de estado con íconos y colores
- Tabla del dashboard con diferentes combinaciones de datos
- Modal de código de seguimiento

### Testing Library

**Configuración actual:**
- **Vitest** como test runner
- **@testing-library/react** para testing de componentes
- **@testing-library/user-event** para simulación de interacciones

**Ejemplo de test:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ReportForm from './ReportForm';

describe('ReportForm', () => {
  it('should show validation errors when submitting empty form', async () => {
    render(<ReportForm />);
    
    const submitButton = screen.getByRole('button', { name: /enviar reporte/i });
    await userEvent.click(submitButton);
    
    expect(screen.getByText(/el título es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/la descripción es obligatoria/i)).toBeInTheDocument();
  });

  it('should create report successfully and show tracking code', async () => {
    const mockPost = vi.fn().mockResolvedValue({ 
      success: true, 
      codigo: 'REP-123' 
    });
    
    render(<ReportForm apiClient={{ createReport: mockPost }} />);
    
    await userEvent.type(screen.getByLabelText(/título/i), 'Bache en la calle');
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Bache grande');
    await userEvent.selectOptions(screen.getByLabelText(/categoría/i), 'Vialidad');
    await userEvent.click(screen.getByText(/capturar ubicación/i));
    
    await userEvent.click(screen.getByRole('button', { name: /enviar reporte/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/REP-123/i)).toBeInTheDocument();
    });
  });
});
```

### Mocking Strategy

**HTTP Requests:**
- Usar `vi.fn()` de Vitest para mockear llamadas API
- Simular delays con `setTimeout` para probar estados de carga
- Mockear respuestas de error para probar manejo de errores

**Browser APIs:**
```typescript
// Mock Geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn((success) => 
    success({ coords: { latitude: 19.4326, longitude: -99.1332 } })
  )
};
global.navigator.geolocation = mockGeolocation;

// Mock MediaDevices API (Camera)
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue(mockStream)
};
```

### Coverage Goals

- **Unit Tests:** >80% coverage en componentes principales
- **Integration Tests:** 100% de flujos críticos (crear reporte, buscar reporte, actualizar estado)
- **Focus en:** Validaciones, manejo de errores, interacciones del usuario

### E2E Tests (Future)

Cuando se implemente el backend completo:
- Flujo completo de creación y consulta de reporte real
- Pruebas con diferentes navegadores y dispositivos
- Testing de geolocalización en dispositivos móviles reales

## Deployment Considerations

1. **Environment Variables**
   - `VITE_API_URL` - URL del backend
   - Configurar en `.env` (no commitear)

2. **Build Output**
   - `npm run build` genera carpeta `dist/`
   - Assets optimizados y minificados
   - Hash en nombres de archivos para cache busting

3. **Browser Support**
   - Modern browsers (ES2020+)
   - Geolocation API support required
   - Camera API optional (graceful degradation)
