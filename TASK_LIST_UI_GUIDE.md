# Guía de Uso - Task List UI

## 🎯 Introducción

La Task List UI es la interfaz principal del panel de DevTools de Auditor ARIA. Permite visualizar, gestionar y dar seguimiento a los errores de accesibilidad encontrados durante las auditorías WCAG.

---

## 📋 Características Principales

### 1. **Auditoría de Componentes**
- Selecciona cualquier elemento HTML en el inspector de DevTools
- Haz clic en "Auditar componente seleccionado"
- El sistema extraerá el HTML y lo enviará al backend para análisis

### 2. **Lista de Errores**
Cada error de accesibilidad se muestra como una "tarea" con:
- **Estado visual**: Badge rojo (Pendiente) o verde (Resuelto)
- **Descripción del error**: Explicación clara del problema
- **Fragmento HTML**: El código que contiene el error
- **Sugerencia de corrección**: Código HTML corregido que puedes copiar

### 3. **Gestión de Tareas**
- **Aceptar corrección**: Marca una tarea como resuelta cuando implementes la corrección
- **Marcar como pendiente**: Revierte una tarea resuelta si necesitas revisarla
- **Eliminar**: Elimina una tarea de la lista (con confirmación)

### 4. **Persistencia Automática**
- Todas las tareas se guardan automáticamente en el navegador
- Si cierras el panel de DevTools, tus tareas se restaurarán al abrirlo de nuevo
- No perderás tu progreso entre sesiones

### 5. **Estadísticas**
Panel superior que muestra en tiempo real:
- **Total**: Número total de tareas
- **Pendientes**: Tareas que aún necesitan corrección (naranja)
- **Resueltos**: Tareas completadas (verde)

---

## 🚀 Flujo de Trabajo Recomendado

### Paso 1: Auditoría Inicial
1. Abre las DevTools de Chrome (F12)
2. Ve a la pestaña "Auditor ARIA"
3. Selecciona un componente en el inspector (Elements)
4. Haz clic en "Auditar componente seleccionado"
5. Espera a que se complete el análisis

### Paso 2: Revisión de Errores
1. Revisa la lista de errores encontrados
2. Lee la descripción de cada error
3. Examina el fragmento HTML problemático
4. Revisa la sugerencia de corrección

### Paso 3: Implementación de Correcciones
1. Copia el código sugerido
2. Aplica la corrección en tu código fuente
3. Haz clic en "Aceptar corrección" para marcar la tarea como resuelta
4. Verás una notificación de éxito

### Paso 4: Verificación
1. Recarga la página con tus cambios
2. Ejecuta una nueva auditoría
3. Verifica que el error ya no aparece
4. Mantén las tareas resueltas como registro

---

## 🎨 Estados Visuales

### Tarea Pendiente
```
┌─────────────────────────────────────┐
│ [✗ Pendiente]                       │
│ Error de Accesibilidad              │
│ Falta atributo alt en imagen        │
│                                     │
│ HTML: <img src="photo.jpg">         │
│                                     │
│ Sugerencia:                         │
│ <img src="photo.jpg" alt="...">     │
│                                     │
│ [Aceptar corrección] [Eliminar]     │
└─────────────────────────────────────┘
```
- Fondo: Blanco
- Borde: Gris
- Badge: Rojo

### Tarea Resuelta
```
┌─────────────────────────────────────┐
│ [✓ Resuelto]                        │
│ Error de Accesibilidad              │
│ Falta atributo alt en imagen        │
│                                     │
│ HTML: <img src="photo.jpg">         │
│                                     │
│ Sugerencia:                         │
│ <img src="photo.jpg" alt="...">     │
│                                     │
│ [Marcar como pendiente] [Eliminar]  │
└─────────────────────────────────────┘
```
- Fondo: Verde claro
- Borde: Verde
- Badge: Verde
- Opacidad: 75%

---

## 💡 Consejos y Trucos

### 1. Auditorías Incrementales
- No es necesario auditar toda la página de una vez
- Audita componentes individuales a medida que los desarrollas
- Esto facilita identificar y corregir errores temprano

### 2. Gestión de Tareas
- No elimines tareas resueltas inmediatamente
- Mantén un registro de lo que has corregido
- Útil para documentación y revisiones

### 3. Copiar Código
- El código sugerido está en bloques `<code>` fáciles de seleccionar
- Haz triple clic para seleccionar todo el bloque
- Copia y pega directamente en tu editor

### 4. Priorización
- Los errores se muestran en el orden que fueron encontrados
- Revisa primero los que afectan funcionalidad crítica
- Usa el criterio WCAG indicado para priorizar

### 5. Verificación
- Después de corregir varios errores, ejecuta una nueva auditoría completa
- Verifica que no introduciste nuevos problemas
- Mantén un ciclo iterativo de auditoría → corrección → verificación

---

## 🔧 Estados de Carga

Durante una auditoría verás los siguientes mensajes:

1. **"Extrayendo DOM..."**
   - El sistema está comunicándose con la página
   - Se está capturando el HTML del elemento seleccionado

2. **"Esperando auditoría..."**
   - El HTML se envió al backend
   - El análisis WCAG está en progreso

3. **"Procesando N resultado(s)..."**
   - Se recibieron los resultados
   - Se están creando las tareas en la UI

---

## ⚠️ Manejo de Errores

### "Por favor, selecciona un elemento HTML en el inspector"
- **Causa**: No hay ningún elemento seleccionado
- **Solución**: Ve a la pestaña "Elements" y selecciona un elemento antes de auditar

### "No se pudo comunicar con la página"
- **Causa**: El content script no está inyectado o la página no responde
- **Solución**: Recarga la página y vuelve a intentar

### "La auditoría excedió el tiempo límite"
- **Causa**: El backend tardó demasiado en responder
- **Solución**: Verifica tu conexión a internet y reintenta

### "¡Excelente! No se encontraron errores de accesibilidad"
- **Causa**: El elemento auditado no tiene errores detectables
- **Solución**: ¡Celebra! Tu código es accesible

---

## 📊 Interpretación de Resultados

### Severidad de Errores
- **Error (critical)**: Debe corregirse inmediatamente, impide el uso a usuarios con discapacidades
- **Warning (moderate)**: Debe corregirse, puede dificultar el uso
- **Info**: Sugerencia de mejora, no crítico

### Criterios WCAG
Cada error está asociado a un criterio WCAG específico:
- **1.1.1**: Contenido no textual (alt en imágenes)
- **1.3.1**: Información y relaciones (estructura semántica)
- **1.4.3**: Contraste mínimo (texto legible)
- **2.1.1**: Teclado (navegación sin mouse)
- **3.1.1**: Idioma de la página
- **4.1.2**: Nombre, función, valor (atributos ARIA)

---

## 🎓 Mejores Prácticas

### 1. Desarrollo Proactivo
- Audita mientras desarrollas, no al final
- Integra la auditoría en tu flujo de trabajo
- Previene acumulación de errores

### 2. Documentación
- Mantén un registro de correcciones comunes
- Documenta patrones accesibles en tu proyecto
- Comparte con tu equipo

### 3. Educación
- Lee sobre los criterios WCAG que aparecen
- Entiende el "por qué" de cada error
- Mejora tu conocimiento de accesibilidad

### 4. Automatización
- Usa la extensión en cada revisión de código
- Integra auditorías en tu pipeline de CI/CD
- No dependas solo de auditorías manuales

### 5. Iteración
- No esperes corregir todo de una vez
- Haz mejoras incrementales
- Prioriza según impacto en usuarios

---

## 🔗 Recursos Adicionales

### Documentación WCAG
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM - Recursos de Accesibilidad](https://webaim.org/)

### Testing Manual
- NVDA (Windows): Lector de pantalla gratuito
- VoiceOver (Mac): Lector de pantalla integrado
- ChromeVox: Extensión de Chrome para testing

### Herramientas Complementarias
- Lighthouse: Auditoría integrada en Chrome DevTools
- axe DevTools: Otra extensión de accesibilidad
- Color Contrast Analyzer: Para verificar contrastes

---

## 📞 Soporte

Si encuentras problemas con la extensión:
1. Verifica que estás usando Chrome con Manifest V3 habilitado
2. Revisa la consola del panel para errores
3. Recarga la extensión en `chrome://extensions`
4. Si el problema persiste, consulta la documentación técnica

---

## 🎉 ¡Felicitaciones!

Ahora sabes cómo usar la Task List UI de Auditor ARIA para crear experiencias web más accesibles. Recuerda: la accesibilidad no es opcional, es un derecho fundamental de todos los usuarios.

**¡Feliz auditoría! 🚀**
