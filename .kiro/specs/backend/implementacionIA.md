# Especificación de Uso de IA en el Proyecto

## 1. Propósito general

La Inteligencia Artificial (IA) se utilizará como un **asistente guía** para el usuario durante el proceso de generación de reportes/quejas, orientándolo sobre los **próximos pasos a seguir** una vez que el reporte ha sido creado o descrito.

El objetivo no es que la IA resuelva la queja por sí misma, sino que **acompañe y oriente** al usuario, reduciendo la incertidumbre sobre "qué hacer ahora" y "a dónde acudir".

## 2. Funciones específicas de la IA

### 2.1 Identificación de la institución competente

- A partir de la descripción del reporte/queja proporcionada por el usuario, la IA analizará el contenido para determinar **qué institución, entidad u organismo** es el responsable de procesar ese tipo de queja.
- Esta identificación puede basarse en:
  - Categoría o tipo de queja (ej. servicios públicos, salud, consumo, laboral, etc.)
  - Palabras clave o entidades mencionadas en el reporte
  - Ubicación geográfica del usuario, si aplica

### 2.2 Sugerencia de próximos pasos

- Una vez identificada la institución, la IA generará una guía clara y ordenada de los **pasos a seguir**, por ejemplo:
  1. Confirmar que la institución identificada es la correcta.
  2. Preparar la documentación o información necesaria.
  3. Elegir el medio de comunicación adecuado para presentar la queja.
  4. Dar seguimiento al caso.

### 2.3 Medios de comunicación disponibles

- La IA proporcionará al usuario los **canales oficiales** que la institución ofrece para procesar la queja, tales como:
  - Sitio web / formulario en línea
  - Correo electrónico
  - Número telefónico o línea de atención
  - Dirección física / oficinas de atención
  - Redes sociales oficiales (si aplica)
  - Aplicaciones móviles institucionales (si existen)

## 3. Flujo de interacción (alto nivel)

```
Usuario describe su reporte/queja
        ↓
Se agrega a la BD
        ↓
Se pasa LA CONSULTA a la BD a la IA siguiendo el formato requerido(vea el 5. )
        ↓
IA analiza el contenido del reporte
        ↓
IA identifica la institución competente
        ↓
IA presenta los medios de comunicación disponibles
        ↓
IA sugiere los próximos pasos a seguir
        ↓
La IA manda esta informacion al usuario
        ↓
Usuario decide cómo proceder
```

## 4. Alcance de la IA

**La IA SÍ hará:**
- Guiar al usuario paso a paso.
- Identificar la institución correspondiente según el tipo de queja.
- Listar los medios/canales oficiales de contacto de dicha institución.
- Explicar de forma clara y accesible el proceso a seguir.

**La IA NO hará:**
- Presentar la queja en nombre del usuario ante la institución.
- Garantizar la resolución del reporte.
- Sustituir asesoría legal formal cuando el caso lo requiera.
- Tomar decisiones vinculantes por el usuario.

## 5. Schema de entrada (lo que la IA debe recibir)

Este es el formato estructurado (JSON) que el sistema debe enviarle a la IA para que pueda analizar el reporte y generar la guía correspondiente.

```json
{
  "reporte_id": "string",
  "descripcion_queja": "string",
  "categoria": "string | null",
  "ubicacion": {
    "pais": "string",
    "provincia_estado": "string | null",
    "ciudad": "string | null"
  },
  "adjuntos": [
    {
      "tipo": "imagen | documento",
      "url": "string"
    }
  ],
  "usuario": {
    "id": "string",
    "idioma_preferido": "default"
  }
}
```

### Notas del schema de entrada
- `categoria` es opcional; si no se envía, la IA debe inferirla a partir de `descripcion_queja`.
- `ubicacion` ayuda a filtrar instituciones cuando existen versiones regionales/locales del mismo organismo.
- `adjuntos` es opcional y solo se usa como contexto adicional, no como evidencia legal.

## 6. Schema de respuesta de la IA

Este es el formato estructurado (JSON) que la IA devolverá al sistema luego de procesar el reporte del usuario. Este schema estandariza la salida para que pueda ser consumida de forma consistente por la aplicación.

```json
{
  "reporte_id": "string",
  "resumen_queja": "string",
  "categoria": "string",
  "institucion": {
    "nombre": "string",
    "descripcion": "string",
    "confianza": "number (0-1)"
  },
  "medios_contacto": [
    {
      "tipo": "web | email | telefono | direccion | red_social | app",
      "valor": "string",
      "detalle": "string"
    }
  ],
  "pasos_siguientes": [
    {
      "orden": "number",
      "descripcion": "string"
    }
  ],
  "requiere_mas_informacion": "boolean",
  "pregunta_aclaratoria": "string | null",
  "timestamp": "string (ISO 8601)"
}
```

### Ejemplo de respuesta

```json
{
  "reporte_id": "rpt_20260726_001",
  "resumen_queja": "Corte de energía eléctrica prolongado sin aviso previo en la zona.",
  "categoria": "servicios_publicos",
  "institucion": {
    "nombre": "Superintendencia de Electricidad (SIE)",
    "descripcion": "Entidad reguladora encargada de recibir quejas sobre el servicio eléctrico.",
    "confianza": 0.92
  },
  "medios_contacto": [
    {
      "tipo": "web",
      "valor": "https://sie.gob.do/reclamos",
      "detalle": "Formulario de reclamos en línea"
    },
    {
      "tipo": "telefono",
      "valor": "809-000-0000",
      "detalle": "Línea de atención al usuario"
    }
  ],
  "pasos_siguientes": [
    { "orden": 1, "descripcion": "Confirmar que la SIE es la institución correcta para tu caso." },
    { "orden": 2, "descripcion": "Reunir evidencia (fotos, facturas, fecha y hora del corte)." },
    { "orden": 3, "descripcion": "Presentar el reclamo vía el formulario web o la línea telefónica." }
  ],
  "requiere_mas_informacion": false,
  "pregunta_aclaratoria": null,
  "timestamp": "2026-07-26T14:30:00Z"
}
```

## 7. Endpoint de salida de la información

La respuesta generada por la IA se expondrá a través de un servicio, que el backend(o cualquier cliente autorizado) consumirá y enviara en el endpoint de | POST | `/api/reportes` | Crear reporte (con Orientación IA) | para mostrar la guía al usuario.

se agrega un endpoint donde se puede consultar la orientacion de ia con | GET | `/api/v1/reportes/{reporte_id}/guia-ia` 

### Request (entrada)

No acepta entrada

### Response (salida)

- **200 OK** → Devuelve el objeto con el schema descrito en la sección 6.
- **206 Partial Content / `requiere_mas_informacion: true`** → La IA no tiene suficiente certeza y devuelve `pregunta_aclaratoria` en lugar de una institución definitiva.
- **400 Bad Request** → Datos de entrada inválidos o incompletos.
- **500 Internal Server Error** → Error al procesar la solicitud con la IA.

### Ejemplo de request

```
GET /api/v1/reportes/rpt_20260726_001/guia-ia
Authorization: Bearer <token>
Content-Type: application/json

```

## 8. Consideraciones adicionales

- **Precisión de la información:** los datos de contacto e instituciones deben mantenerse actualizados; se recomienda validar periódicamente contra fuentes oficiales.
- **Transparencia:** el usuario debe poder ver claramente en qué se basó la IA para identificar la institución sugerida.
- **Fallback:** si la IA no logra identificar con certeza la institución correspondiente, debe indicarlo explícitamente y ofrecer opciones generales o solicitar más información al usuario en lugar de asumir una respuesta incorrecta.