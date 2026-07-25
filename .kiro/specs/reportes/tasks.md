# Implementation Plan

## Overview
Este documento detalla la construcción de la interfaz frontend (React + Vite) para la Plataforma de Reportes Ciudadanos. Se enfoca en el andamiaje del proyecto, la integración de Tailwind y shadcn/ui, y la creación de los layouts visuales (con datos mock) mientras el backend finaliza el contrato de la API.

## Tasks

- [x] 1. Andamiaje del Proyecto Frontend
  - [x] 1.1 Inicializar proyecto con Vite + React e instalar Tailwind CSS
    - Configurar Vite con React y TypeScript
    - Instalar y configurar Tailwind CSS
    - _Requirements: Req 5_
  
  - [x] 1.2 Configurar la librería shadcn/ui y estructurar el enrutador base (React Router)
    - Instalar shadcn/ui y sus dependencias
    - Configurar React Router con rutas para formulario ciudadano y dashboard
    - _Requirements: Req 5_

- [ ] 2. Layout del Formulario Ciudadano
  - [-] 2.1 Crear componentes base del formulario usando shadcn/ui
    - Implementar inputs para título y descripción
    - Implementar select para categoría
    - _Requirements: Req 1, Req 4_
  
  - [x] 2.2 Implementar captura de ubicación (GPS automático y manual)
    - Agregar botón para captura automática con API de geolocalización del navegador
    - Agregar input de texto para ingreso manual de dirección
    - Solicitar permisos de geolocalización cuando se active captura automática
    - Mostrar coordenadas capturadas (latitud/longitud) o dirección manual
    - _Requirements: Req 2_
  
  - [x] 2.3 Implementar carga de imagen (desde archivo y cámara si disponible)
    - Agregar input de tipo file con accept="image/jpeg,image/png,image/webp"
    - Detectar disponibilidad de cámara y agregar opción de captura directa si está disponible
    - Validar tipo de archivo (jpg, png, webp) y tamaño máximo (5MB)
    - Mostrar preview de la imagen seleccionada
    - _Requirements: Req 3_
  
  - [x] 2.4 Implementar validación local de campos obligatorios
    - Validar que título, descripción, categoría y ubicación estén completos antes de enviar
    - Mostrar mensajes de error específicos para cada campo faltante
    - Permitir envío sin imagen (evidencia es opcional)
    - Eliminar mensajes de error en tiempo real cuando el usuario corrija los campos
    - _Requirements: Req 4_

- [ ] 3. Layout del Dashboard de Administración
  - [-] 3.1 Construir tabla de datos mockeados con columnas específicas
    - Crear tabla con columnas: ID, título, categoría, prioridad, estado, fecha de creación, ubicación
    - Generar datos mock que incluyan todos estos campos
    - Implementar ordenamiento por fecha de creación en orden descendente (más recientes primero)
    - _Requirements: Req 5_
  
  - [x] 3.2 Implementar selectores de filtro visual y dropdown para cambio de estado
    - Agregar controles de filtro para prioridad y categoría
    - Implementar dropdown de estado con los 5 valores válidos: "Pendiente", "En Revisión", "En Progreso", "Resuelto", "Rechazado"
    - Actualizar visualmente el estado en la tabla cuando se cambie desde el dropdown
    - _Requirements: Req 6_
  
  - [x] 3.3 Implementar indicadores de carga para operaciones HTTP
    - Mostrar spinners o skeletons durante peticiones GET, POST, PATCH
    - Deshabilitar controles de envío mientras una petición está en progreso
    - Ocultar indicador y rehabilitar controles cuando la petición finalice
    - _Requirements: Req 7_

## Notes

- Mantener estrictamente el máximo de 2 niveles de jerarquía por tarea.
- Las llamadas HTTP deben centralizarse en servicios o hooks personalizados para facilitar la integración posterior.
- El frontend es una capa de presentación estricta sin lógica de negocio.
- La validación de formularios es local y solo previene envíos vacíos; la validación de negocio ocurre en el backend.
- Las variables de entorno deben configurarse en `.env` y estar listadas en `.gitignore` para evitar exponer credenciales.
- La captura de ubicación debe soportar tanto GPS automático (con solicitud de permisos) como ingreso manual de dirección.
- La carga de imagen es opcional pero debe validar tipo (jpg/png/webp) y tamaño (max 5MB) cuando esté presente.
- El dashboard debe mostrar todas las columnas especificadas (ID, título, categoría, prioridad, estado, fecha de creación, ubicación) en orden descendente por fecha.
- Los estados válidos del dropdown son exactamente: "Pendiente", "En Revisión", "En Progreso", "Resuelto", "Rechazado".

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1"] },
    { "id": 3, "tasks": ["2.2", "2.3"] },
    { "id": 4, "tasks": ["2.4", "3.2"] },
    { "id": 5, "tasks": ["3.3"] }
  ]
}
```