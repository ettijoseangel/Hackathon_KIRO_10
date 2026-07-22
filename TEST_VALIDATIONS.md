# Pruebas de Validación - Tarea 2.2

## Objetivo
Verificar que las validaciones de elementos vacíos y emisión de errores funcionan correctamente en `content.js`.

## Casos de Prueba

### 1. Elemento No Seleccionado (Ya existente - mejorado)
**Escenario:** No hay elemento seleccionado en el inspector
**Resultado esperado:**
```json
{
  "success": false,
  "error": "NO_ELEMENT_SELECTED",
  "message": "Por favor, selecciona un elemento HTML en el inspector"
}
```

### 2. Elemento Vacío - DIV sin contenido
**Escenario:** Seleccionar `<div></div>` o `<div id="test"></div>` sin contenido
**Resultado esperado:**
```json
{
  "success": false,
  "error": "EMPTY_ELEMENT",
  "message": "El elemento <div> está vacío. Selecciona un elemento con contenido para auditar su accesibilidad"
}
```

### 3. Elemento Interactivo Vacío - Botón sin contenido
**Escenario:** Seleccionar `<button></button>` sin texto ni atributos
**Resultado esperado:**
```json
{
  "success": false,
  "error": "EMPTY_ELEMENT",
  "message": "El elemento <button> no tiene contenido ni atributos. Los elementos interactivos deben tener texto o atributos ARIA para ser accesibles"
}
```

### 4. Elemento Autocontenido - Imagen
**Escenario:** Seleccionar `<img src="test.jpg" alt="test">`
**Resultado esperado:** ✅ **VÁLIDO** - Las imágenes son elementos autocontenidos auditables
```json
{
  "success": true,
  "html": "<img src=\"test.jpg\" alt=\"test\">"
}
```

### 5. Elemento No Auditable - Script
**Escenario:** Seleccionar `<script>console.log('test');</script>`
**Resultado esperado:**
```json
{
  "success": false,
  "error": "INSUFFICIENT_CONTENT",
  "message": "Los elementos <script> no son auditables para accesibilidad. Selecciona un elemento de contenido visible"
}
```

### 6. Elemento No Auditable - Style
**Escenario:** Seleccionar `<style>.test { color: red; }</style>`
**Resultado esperado:**
```json
{
  "success": false,
  "error": "INSUFFICIENT_CONTENT",
  "message": "Los elementos <style> no son auditables para accesibilidad. Selecciona un elemento de contenido visible"
}
```

### 7. Elemento Válido - Botón con texto
**Escenario:** Seleccionar `<button>Clic aquí</button>`
**Resultado esperado:** ✅ **VÁLIDO**
```json
{
  "success": true,
  "html": "<button>Clic aquí</button>"
}
```

### 8. Elemento Válido - DIV con contenido
**Escenario:** Seleccionar `<div class="container"><p>Texto</p></div>`
**Resultado esperado:** ✅ **VÁLIDO**
```json
{
  "success": true,
  "html": "<div class=\"container\"><p>Texto</p></div>"
}
```

### 9. Elemento Muy Pequeño
**Escenario:** HTML extraído con menos de 10 caracteres
**Resultado esperado:**
```json
{
  "success": false,
  "error": "INSUFFICIENT_CONTENT",
  "message": "El elemento seleccionado es demasiado pequeño para realizar una auditoría significativa"
}
```

### 10. Contenido Sin Etiquetas HTML Válidas
**Escenario:** Contenido extraído que no contiene etiquetas HTML
**Resultado esperado:**
```json
{
  "success": false,
  "error": "INSUFFICIENT_CONTENT",
  "message": "El contenido extraído no contiene etiquetas HTML válidas"
}
```

## Validaciones Implementadas

### `validateElementNotEmpty(element)`
- ✅ Detecta elementos sin texto ni hijos
- ✅ Permite elementos autocontenidos (img, input, br, hr, etc.)
- ✅ Valida específicamente elementos interactivos (button, a, label)
- ✅ Mensajes de error descriptivos según el tipo de elemento

### `validateElementContent(element, htmlSnippet)`
- ✅ Valida que el HTML no esté vacío
- ✅ Valida longitud mínima (10 caracteres)
- ✅ Valida presencia de etiquetas HTML válidas
- ✅ Rechaza elementos no auditables (script, style, noscript)
- ✅ Mensajes de error claros y específicos

## Mejoras Aplicadas en Requirement 2

1. **Validación mejorada de mensajes de error:** Todos los mensajes son descriptivos y guían al usuario
2. **Detección de elementos vacíos:** Nueva función `validateElementNotEmpty`
3. **Validación de contenido útil:** Nueva función `validateElementContent`
4. **Códigos de error específicos:** EMPTY_ELEMENT, INSUFFICIENT_CONTENT
5. **Validación de elementos autocontenidos:** img, input, svg, canvas, etc.
6. **Validación de elementos interactivos:** button, a, label requieren contenido
7. **Rechazo de elementos no auditables:** script, style, noscript

## Cómo Probar Manualmente

1. Cargar la extensión en Chrome (`chrome://extensions/`)
2. Activar "Modo de desarrollador"
3. Abrir DevTools en cualquier página web
4. Ir al panel "Auditor ARIA"
5. Seleccionar diferentes elementos en el inspector de elementos
6. Hacer clic en "Auditar componente seleccionado"
7. Verificar los mensajes de error en cada caso
