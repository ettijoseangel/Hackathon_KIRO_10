# 🚀 Guía Rápida: Estados de Carga Granulares

## Para Desarrolladores

### 📖 ¿Qué es esto?
Sistema de feedback visual que muestra al usuario qué está sucediendo durante el proceso de auditoría de accesibilidad. Implementa el **Requirement 3** del spec.

### 🎯 Estados Disponibles

```javascript
// Estado 1: Al comunicarse con el content script
showLoading('Extrayendo DOM...');

// Estado 2: Al esperar respuesta del backend
showLoading('Esperando auditoría...');

// Estado 3: Al procesar y guardar resultados
showLoading('Procesando 5 resultado(s)...');

// Limpiar estado (siempre en bloque finally)
hideLoading();
```

### 💻 Uso Básico

```javascript
async function miOperacionAsincrona() {
  try {
    // Mostrar estado de carga
    showLoading('Mensaje descriptivo...');
    
    // Tu código asíncrono aquí
    await operacion();
    
  } catch (error) {
    // Manejar errores
    showAlert('Mensaje de error');
    
  } finally {
    // ⚡ IMPORTANTE: Siempre limpiar en finally
    hideLoading();
  }
}
```

### ✅ Mejores Prácticas

1. **Siempre usar finally**
   ```javascript
   // ❌ MAL - No garantiza limpieza
   showLoading('Cargando...');
   await operacion();
   hideLoading(); // Puede no ejecutarse si hay error
   
   // ✅ BIEN - Garantiza limpieza
   try {
     showLoading('Cargando...');
     await operacion();
   } finally {
     hideLoading(); // Siempre se ejecuta
   }
   ```

2. **Mensajes descriptivos**
   ```javascript
   // ❌ MAL - Vago
   showLoading('Procesando...');
   
   // ✅ BIEN - Específico
   showLoading('Procesando 3 resultado(s)...');
   ```

3. **Un estado a la vez**
   ```javascript
   // ❌ MAL - Múltiples estados simultáneos
   showLoading('Estado 1');
   showLoading('Estado 2'); // Sobrescribe el anterior
   
   // ✅ BIEN - Secuencial
   showLoading('Estado 1');
   await fase1();
   showLoading('Estado 2');
   await fase2();
   ```

### 🔍 Debugging

Los estados registran automáticamente en consola:

```javascript
showLoading('Extrayendo DOM...');
// Console: [Panel] Estado de carga: Extrayendo DOM...

hideLoading();
// Console: [Panel] Estado de carga ocultado
```

### 🧪 Testing

```javascript
// En consola del panel de DevTools
// 1. Copiar y pegar test-loading-states.js
// 2. El script se ejecuta automáticamente
// 3. Ver resultados en consola
```

### 📝 API Completa

#### `showLoading(message: string): void`
Muestra el spinner de carga con un mensaje personalizado.

**Parámetros:**
- `message` (string): Mensaje descriptivo del estado actual

**Ejemplo:**
```javascript
showLoading('Esperando auditoría...');
```

#### `hideLoading(): void`
Oculta el spinner de carga.

**Ejemplo:**
```javascript
hideLoading();
```

### 🎨 Personalización del HTML

El elemento visual está en `panel.html`:

```html
<div id="loading-state" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 hidden">
  <div class="flex items-center">
    <!-- Spinner SVG animado (Tailwind: animate-spin) -->
    <svg class="animate-spin h-5 w-5 text-aria-primary mr-3" ...>
      ...
    </svg>
    
    <!-- Mensaje dinámico -->
    <span id="loading-message" class="text-sm text-gray-700 font-medium">
      Inicializando...
    </span>
  </div>
</div>
```

**Clases Tailwind principales:**
- `animate-spin`: Animación de rotación del spinner
- `hidden`: Oculta el elemento
- `bg-blue-50`: Fondo azul claro
- `text-aria-primary`: Color del spinner (definido en config)

### ⚠️ Errores Comunes

1. **Olvidar el bloque finally**
   - ❌ Problema: El spinner se queda visible después de un error
   - ✅ Solución: Usar siempre `try-finally`

2. **No deshabilitar el botón**
   ```javascript
   // ✅ Deshabilitar botón mientras se carga
   auditBtn.disabled = true;
   try {
     showLoading('...');
     // ...
   } finally {
     hideLoading();
     auditBtn.disabled = false; // Rehabilitar
   }
   ```

3. **Llamar hideLoading() múltiples veces**
   - ✅ No hay problema: hideLoading() es idempotente

### 📚 Recursos

- **Documentación técnica completa**: `TASK_4.1_LOADING_STATES.md`
- **Suite de tests**: `test-loading-states.js`
- **Diagrama de flujo**: `LOADING_STATES_FLOW.txt`
- **Resumen de implementación**: `TASK_4.1_SUMMARY.md`

### 🤝 Contribuir

Al añadir nuevos estados de carga:

1. Usar mensajes descriptivos y específicos
2. Seguir el patrón establecido (verbo + contexto)
3. Actualizar documentación
4. Añadir test en `test-loading-states.js`

### 📞 Soporte

Si encuentras problemas:
1. Revisar consola del panel (click derecho → Inspeccionar)
2. Ejecutar `test-loading-states.js` para diagnóstico
3. Verificar que los elementos DOM existen (`#loading-state`, `#loading-message`)

---

**Última actualización**: Task 4.1 - 2024
**Mantenedor**: Auditor ARIA Team
