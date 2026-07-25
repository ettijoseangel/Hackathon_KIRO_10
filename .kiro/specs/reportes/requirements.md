# Requirements Document

## Introduction
Sistema de reportes ciudadanos que permite a los ciudadanos reportar problemas comunitarios y consultar el estado de sus reportes mediante un código de seguimiento. Los administradores gestionan los reportes a través de un dashboard administrativo.

## Glossary
- **Sistema**: La aplicación frontend de Reportes Ciudadanos construida con React y Vite.
- **Ciudadano**: Usuario público que crea reportes y consulta su estado.
- **Administrador**: Usuario con acceso al dashboard para gestionar reportes.
- **Código de Seguimiento**: Identificador único generado al crear un reporte (formato: REP-XXX).
- **Payload**: Conjunto de datos en formato JSON que se envía al backend vía HTTP.
- **EARS**: Easy Approach to Requirements Syntax.
- **shadcn/ui**: Colección de componentes de UI reusables construidos con Tailwind CSS.
- **GPS**: Sistema de Posicionamiento Global que proporciona coordenadas de latitud y longitud.
- **Evidencia**: Imagen o fotografía adjunta al reporte como prueba visual del problema reportado.
- **Estados_del_Reporte**: Valores válidos que representan el ciclo de vida de un reporte: "Pendiente", "En Revisión", "En Progreso", "Resuelto", "Rechazado".

## Requirements

### Requirement 1: Creación de Reporte Ciudadano

**User Story:** Como ciudadano, quiero crear un reporte con todos los detalles necesarios, para que las autoridades tengan la información completa del problema.

#### Acceptance Criteria

1. WHEN el usuario completa el formulario con datos válidos y hace clic en enviar, THE Sistema SHALL realizar una petición HTTP POST al backend con un payload JSON que incluye: título (string), descripción (string), categoría (string), ubicación (objeto con latitud/longitud o dirección), e imagen/evidencia (file o base64 string si está presente).

2. WHEN la petición HTTP POST es exitosa, THE Sistema SHALL generar y mostrar un código de seguimiento único en formato "REP-XXX".

3. WHEN se muestra el código de seguimiento, THE Sistema SHALL permitir al usuario copiar el código al portapapeles mediante un botón.

4. WHEN se muestra el código de seguimiento, THE Sistema SHALL mostrar una advertencia para guardar el código.

### Requirement 2: Captura de Ubicación

**User Story:** Como ciudadano, quiero registrar la ubicación exacta del problema, para que las autoridades sepan dónde atenderlo.

#### Acceptance Criteria

1. WHEN el usuario accede al formulario de creación de reporte, THE Sistema SHALL permitir capturar la ubicación mediante GPS automático o ingreso manual de dirección.

2. WHEN el usuario selecciona captura automática de ubicación, THE Sistema SHALL solicitar permisos de geolocalización y obtener las coordenadas de latitud y longitud.

3. WHEN el usuario selecciona ingreso manual, THE Sistema SHALL permitir escribir una dirección en formato texto.

### Requirement 3: Carga de Evidencia Visual

**User Story:** Como ciudadano, quiero adjuntar una imagen del problema, para proporcionar evidencia visual que facilite la evaluación del reporte.

#### Acceptance Criteria

1. WHEN el usuario está completando el formulario, THE Sistema SHALL permitir cargar una imagen desde el sistema de archivos local.

2. WHERE el dispositivo tiene cámara disponible, THE Sistema SHALL permitir capturar una imagen directamente desde la cámara.

3. WHEN el usuario selecciona una imagen, THE Sistema SHALL validar que el archivo sea de tipo imagen (jpg, png, webp) y tenga un tamaño máximo de 5MB.

### Requirement 4: Validación de Campos Obligatorios

**User Story:** Como sistema, quiero validar los datos antes de enviarlos, para garantizar que el backend reciba información completa y válida.

#### Acceptance Criteria

1. IF el usuario intenta enviar el reporte sin completar título, descripción, categoría o ubicación, THEN THE Sistema SHALL bloquear el envío y mostrar mensajes de error específicos para cada campo faltante.

2. THE Sistema SHALL permitir el envío del reporte sin imagen adjunta, dado que la evidencia visual es opcional.

3. WHEN el usuario corrige los campos con errores, THE Sistema SHALL eliminar los mensajes de error correspondientes en tiempo real.

### Requirement 5: Consulta de Reporte por Código

**User Story:** Como ciudadano, quiero consultar el estado de mi reporte ingresando el código de seguimiento, para saber el progreso de su atención.

#### Acceptance Criteria

1. WHEN el usuario accede a la página "Mis Reportes", THE Sistema SHALL mostrar un formulario de búsqueda que solicita el código de seguimiento.

2. WHEN el usuario ingresa un código válido y hace clic en buscar, THE Sistema SHALL realizar una petición HTTP GET al backend con el código como parámetro.

3. WHEN la petición retorna un reporte exitosamente, THE Sistema SHALL mostrar: título, categoría, estado actual, fecha de creación, ubicación y descripción del estado.

4. WHEN el código ingresado no existe en el sistema, THE Sistema SHALL mostrar un mensaje de error indicando que no se encontró el reporte.

5. WHEN se muestra un reporte, THE Sistema SHALL usar íconos y colores distintivos para cada estado (Pendiente, En Revisión, En Progreso, Resuelto, Rechazado).

### Requirement 6: Separación de Vistas Ciudadano/Administrador

**User Story:** Como sistema, quiero separar las funcionalidades de ciudadanos y administradores, para que cada tipo de usuario tenga acceso apropiado.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar en el menú de navegación público únicamente las opciones: "Crear Reporte" y "Mis Reportes".

2. THE Sistema SHALL mantener el dashboard administrativo accesible únicamente mediante URL directa (/dashboard), sin mostrarlo en el menú de navegación público.

3. WHEN un ciudadano consulta un reporte en "Mis Reportes", THE Sistema SHALL mostrar únicamente información de lectura sin permitir modificación de estado.

### Requirement 7: Visualización del Dashboard Administrativo

**User Story:** Como administrador, quiero ver todos los reportes en una tabla organizada, para gestionar y dar seguimiento a cada caso.

#### Acceptance Criteria

1. WHEN el administrador accede a la ruta del dashboard, THE Sistema SHALL realizar una petición HTTP GET para obtener la lista de reportes.

2. WHEN la petición retorna datos exitosamente, THE Sistema SHALL renderizar una tabla mostrando: ID del reporte, título, categoría, prioridad, estado, fecha de creación, y ubicación.

3. THE Sistema SHALL mostrar los reportes en orden descendente por fecha de creación (más recientes primero).

### Requirement 8: Actualización de Estado del Reporte

**User Story:** Como administrador, quiero cambiar el estado de un reporte, para reflejar el progreso de su atención.

#### Acceptance Criteria

1. WHEN el administrador cambia el estado de un reporte desde el dropdown de la tabla, THE Sistema SHALL realizar una petición HTTP PATCH al endpoint correspondiente con el nuevo estado.

2. THE Sistema SHALL validar que el estado seleccionado sea uno de los Estados_del_Reporte válidos: "Pendiente", "En Revisión", "En Progreso", "Resuelto", "Rechazado".

3. WHEN la actualización es exitosa, THE Sistema SHALL actualizar visualmente el estado en la tabla sin recargar la página completa.

### Requirement 9: Indicadores de Carga

**User Story:** Como usuario, quiero ver indicadores visuales durante las operaciones, para saber que el sistema está procesando mi solicitud.

#### Acceptance Criteria

1. THE Sistema SHALL mostrar indicadores visuales de carga (spinners o skeletons) durante cualquier petición HTTP (GET, POST, PATCH).

2. WHILE una petición HTTP está en progreso, THE Sistema SHALL deshabilitar los controles de envío para evitar interacciones duplicadas.

3. WHEN la petición finaliza (exitosa o con error), THE Sistema SHALL ocultar el indicador de carga y rehabilitar los controles.

### Requirement 10: Estilos Visuales Consistentes

**User Story:** Como usuario, quiero una interfaz visualmente atractiva y consistente, para tener una mejor experiencia de uso.

#### Acceptance Criteria

1. THE Sistema SHALL utilizar una paleta de colores con gradientes azules e índigos para elementos principales.

2. THE Sistema SHALL aplicar fondos sólidos y no transparentes a todos los componentes interactivos (inputs, selects, buttons).

3. THE Sistema SHALL usar bordes gruesos (2px) y sombras para dar profundidad a los elementos.

4. THE Sistema SHALL aplicar colores específicos a botones según su función: verde para GPS, morado para archivos, rosa para cámara, rojo para eliminar, azul para acciones principales.
