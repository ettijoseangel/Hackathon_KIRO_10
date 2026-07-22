/**
 * devtools.js
 * Script de inicio que crea el panel de DevTools para Auditor ARIA
 * Cumple con las políticas CSP de Manifest V3 (sin código inline)
 */

// Crear el panel de DevTools con chrome.devtools.panels API
chrome.devtools.panels.create(
  "Auditor ARIA",           // Título del panel
  "icons/icon16.svg",       // Icono del panel
  "panel.html",             // Página HTML del panel
  (panel) => {
    console.log("Panel de Auditor ARIA creado exitosamente");
    
    // Listener para cuando el panel se muestre (opcional para logs)
    panel.onShown.addListener((panelWindow) => {
      console.log("Panel de Auditor ARIA mostrado");
    });
    
    // Listener para cuando el panel se oculte (opcional para logs)
    panel.onHidden.addListener(() => {
      console.log("Panel de Auditor ARIA oculto");
    });
  }
);
