/**
 * Configuracion de Swagger/OpenAPI.
 * Documentacion interactiva de la API con tema oscuro.
 * Accesible en /api/docs
 */
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { config } from './config.js'

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Reportes Ciudadanos API',
      version: '1.0.0',
      description: 'API REST para la plataforma de Reportes Ciudadanos en México. Permite crear, consultar y gestionar reportes de problemas comunitarios (agua, alumbrado, bacheo, etc.) con clasificacion automatica de prioridad mediante IA.',
      contact: {
        name: 'David Chavarria, Michel',
        url: 'https://github.com/ettijoseangel/Hackathon_KIRO_10'
      }
    },
    servers: [
      {
        url: config.docs.apiEndpoint,
        description: config.env === 'production' ? 'Produccion' : 'Desarrollo local'
      }
    ]
  },
  apis: ['./src/routes/*.js']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

// Opciones de UI con tema oscuro
const swaggerUiOptions = {
  customCss: `
    .swagger-ui { background-color: #1a1a2e; }
    .swagger-ui .topbar { background-color: #16213e; }
    .swagger-ui .info .title { color: #e2e8f0; }
    .swagger-ui .info p, .swagger-ui .info li { color: #cbd5e1; }
    .swagger-ui .scheme-container { background-color: #16213e; box-shadow: none; }
    .swagger-ui .opblock-tag { color: #e2e8f0; border-bottom-color: #334155; }
    .swagger-ui section.models { border-color: #334155; }
    .swagger-ui .model-title { color: #e2e8f0; }
    .swagger-ui .model { color: #cbd5e1; }
    body { background-color: #0f0f23; }
  `,
  customSiteTitle: 'Reportes Ciudadanos - API Docs'
}

/**
 * Registra las rutas de Swagger en la app de Express.
 * @param {import('express').Express} app - Instancia de Express
 */
export function setupSwagger (app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))

  // Endpoint para obtener el spec JSON (util para herramientas externas)
  app.get('/api/docs.json', (req, res) => {
    res.json(swaggerSpec)
  })
}
