# Configuración de shadcn/ui y React Router

## Resumen
Este documento detalla la configuración completada para shadcn/ui y React Router en el proyecto de Reportes Ciudadanos.

## shadcn/ui

### Estado de la Configuración
✅ **Completamente configurado y funcional**

### Componentes Instalados
- **Button** (`src/components/ui/button.tsx`): Componente de botón con variantes (default, destructive, outline, secondary, ghost, link) y tamaños (default, sm, lg, icon)

### Archivos de Configuración

#### `components.json`
Archivo de configuración oficial de shadcn/ui que define:
- Estilo: default
- TypeScript: activado (tsx)
- Tailwind CSS: configurado con variables CSS
- Aliases de rutas: @/components, @/lib/utils, @/components/ui

#### `src/lib/utils.ts`
Función utilitaria `cn()` para combinar clases de Tailwind CSS usando `clsx` y `tailwind-merge`.

#### `src/index.css`
Variables CSS de shadcn/ui definidas para tema claro y oscuro:
- Colores: background, foreground, primary, secondary, muted, accent, destructive, border, input, ring
- Border radius: --radius (0.5rem)

#### `tailwind.config.js`
Configuración de Tailwind extendida con:
- Colores personalizados usando variables CSS HSL
- Border radius usando variables CSS
- Content paths para procesamiento

### Dependencias Instaladas
```json
{
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^1.26.0",
  "tailwind-merge": "^3.6.0"
}
```

### Agregar Nuevos Componentes
Para agregar componentes adicionales de shadcn/ui, ejecutar:
```bash
npx shadcn@latest add [nombre-componente]
```

Ejemplos:
```bash
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add table
```

## React Router

### Estado de la Configuración
✅ **Completamente configurado y funcional**

### Estructura de Rutas

```
/                    → Formulario Ciudadano (ReportForm)
/dashboard           → Dashboard Administrativo (Dashboard)
```

### Archivos Relacionados

#### `src/App.tsx`
Configuración principal del router con `BrowserRouter`:
- Layout principal compartido entre rutas
- Ruta index (`/`) muestra el formulario de reportes
- Ruta `/dashboard` muestra el tablero administrativo

#### `src/components/Layout.tsx`
Componente de layout que incluye:
- Barra de navegación con enlaces a ambas rutas
- Outlet de React Router para renderizar componentes hijos

#### `src/pages/ReportForm.tsx`
Página del formulario ciudadano en construcción.

#### `src/pages/Dashboard.tsx`
Página del dashboard administrativo con tabla de reportes mock.

### Dependencias Instaladas
```json
{
  "react-router-dom": "^7.11.0"
}
```

### Navegación
La navegación entre rutas se realiza mediante:
- Componente `Link` de React Router en la barra de navegación
- Navegación programática disponible con hook `useNavigate()`

## Verificación

### Comandos de Verificación

#### Desarrollo
```bash
npm run dev
```
Servidor de desarrollo en http://localhost:5173/

#### Build
```bash
npm run build
```
Genera build de producción en `dist/`

#### Lint
```bash
npm run lint
```
Verifica código con ESLint

### Estado de Verificación
✅ Servidor de desarrollo inicia correctamente
✅ Build de producción se completa sin errores
✅ TypeScript compila sin errores
✅ Rutas de React Router funcionan correctamente
✅ Componentes de shadcn/ui renderizan correctamente

## Próximos Pasos

### Tarea 2.1: Componentes Base del Formulario
- Instalar componentes adicionales de shadcn/ui (input, textarea, select, label)
- Implementar campos de título, descripción y categoría

### Tarea 2.2: Captura de Ubicación
- Implementar captura GPS con API de geolocalización
- Agregar input manual de dirección

### Tarea 2.3: Carga de Imagen
- Implementar input de archivo para imágenes
- Agregar validación de tipo y tamaño
- Implementar preview de imagen

## Notas Técnicas

- **Alias de Rutas**: El proyecto usa `@/*` para importaciones desde `src/`
- **CSS Variables**: Los colores de shadcn/ui usan variables CSS HSL para facilitar theming
- **TypeScript**: El proyecto usa TypeScript 6.0.2 con configuración estricta
- **Vite**: Configurado con plugin de React y resolución de aliases

## Requisitos Cumplidos

- ✅ **Req 5**: Visualización del Dashboard Administrativo
  - React Router configurado con ruta `/dashboard`
  - Layout con navegación entre formulario y dashboard
  - Estructura base para futuras implementaciones
