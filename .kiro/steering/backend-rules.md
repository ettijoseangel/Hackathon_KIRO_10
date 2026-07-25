---
inclusion: fileMatch
fileMatchPattern: "server/**"
---

# Steering: Reglas del Backend

## Stack Técnico
- Node.js + Express
- Supabase (Postgres) con `service_role key`
- Variables de entorno en `server/.env` (nunca se sube a git)
- El frontend se comunica con el backend solo por HTTP (`/api/...`)
- En desarrollo, el proxy de Vite redirige `/api` al puerto del backend

## Flujo de Trabajo por Módulo
1. Leer el código relevante existente.
2. Planificar el cambio (explicar qué se va a hacer).
3. Implementar el cambio mínimo necesario.
4. Verificar que compila/funciona (el servidor levanta sin errores).
5. Commit atómico del código.
6. **Validar manualmente en Postman** — el usuario confirma que el endpoint responde correctamente.
7. **Agregar tests** del módulo recién creado (unitarios y/o de integración según aplique).
8. Commit atómico de tests.
9. Pasar a la siguiente tarea.

## Regla de Avance Estricta
- NO se puede avanzar al siguiente módulo/endpoint hasta que:
  1. El módulo actual haya sido validado manualmente por el usuario (Postman u otra herramienta).
  2. Los tests del módulo actual estén escritos y pasen correctamente.
- Esta regla aplica a cada endpoint y cada servicio del backend sin excepción.

## Calidad de Código
- **Código limpio y escalable:** nombres descriptivos, funciones pequeñas con responsabilidad única, sin código muerto.
- **Principios SOLID:**
  - Single Responsibility: cada módulo/archivo tiene una sola razón para cambiar.
  - Open/Closed: diseñar para extender sin modificar lo existente.
  - Liskov Substitution: las abstracciones deben ser intercambiables.
  - Interface Segregation: no forzar dependencias innecesarias.
  - Dependency Inversion: depender de abstracciones, no de implementaciones concretas.
- **Principio DRY:** no repetir lógica — extraer a funciones/módulos reutilizables.

## Testing
- Tests unitarios para funciones y servicios individuales.
- Tests de integración para los endpoints (request → response).
- Usar el framework de testing estándar del ecosistema (vitest o jest).
- Cada feature nueva debe incluir o actualizar sus tests correspondientes.
- Los tests deben pasar ANTES de marcar una tarea como completa.

## Seguridad
- La `service_role key` solo vive en `server/.env` — nunca se expone al frontend.
- Validar toda entrada del usuario antes de llegar a Supabase.
- No exponer stack traces al cliente — solo mensajes genéricos en errores 500.
- Respetar el principio de mínimo privilegio.
