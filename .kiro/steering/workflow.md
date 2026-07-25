---
inclusion: always
---

# Steering: Reglas Generales de Trabajo

## Commits Atómicos (Obligatorio)
- Cada commit DEBE representar UN solo cambio lógico y autocontenido.
- No mezclar features con refactors, ni fixes con cambios cosméticos.
- Si una tarea implica más de un concern (ej: crear archivo + modificar config), dividir en commits separados solo si cada uno tiene sentido por sí solo.
- Formato de mensajes: Conventional Commits en español para la descripción:
  - `feat: crear servidor Express básico en puerto 3001`
  - `fix: corregir validación de campos obligatorios`
  - `refactor: extraer lógica de filtrado a función separada`
  - `docs: agregar README con instrucciones de instalación`
  - `chore: agregar dependencias de Supabase`
  - `test: agregar tests de integración para POST /api/reportes`
- Nunca generar un commit gigante con múltiples features.
- Antes de cada commit, verificar que el código compila/funciona.

## Reglas Anti-Alucinación
- NUNCA generar código sin haber leído primero los archivos involucrados.
- NUNCA inventar endpoints, funciones o dependencias que no existan en el proyecto o no estén documentadas en los specs/contratos.
- Si algo no se sabe con certeza, PREGUNTAR al usuario antes de asumir.
- No generar múltiples features en un solo paso — ir una tarea a la vez.
- Verificar que el código compila antes de declarar una tarea como completa.

## Reglas de Branching
- Features en `feature/<nombre-corto>`
- Fixes en `fix/<nombre-corto>`
- Nunca push directo a main sin confirmación del usuario.

## Principio General
- Ir despacio pero con código limpio, seguro y escalable.
- Módulo por módulo, nunca todo de golpe.
- Cada módulo debe estar validado y testeado antes de avanzar al siguiente.

## Reglas de Idioma
- **Regla Estricta:** Toda la documentación interna, la redacción de requerimientos, los planes de tareas, el diseño y las respuestas generadas por Kiro DEBEN estar exclusivamente en **Español**.
- **Excepción:** Únicamente las palabras clave de la metodología EARS (WHEN, THE SYSTEM SHALL, IF, etc.) y la sintaxis pura del código (variables, funciones, HTML) permanecerán en inglés.
