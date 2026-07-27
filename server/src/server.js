import express from 'express'
import cors from 'cors'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config/config.js'
import { setupSwagger } from './config/swagger.js'
import reportesRouter from './routes/reportes.js'
import guiaIARouter from './routes/guiaIa.js'
import { securityHeaders, generalLimiter, sanitizeBody, errorHandler } from './middleware/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = http.createServer(app)

// --- Middleware de seguridad ---
app.use(securityHeaders())
app.use(generalLimiter())

// --- Middleware de parseo y CORS ---
app.use(cors({
    origin: config.clientOrigin
}))
app.use(express.json({ limit: '1mb' }))
app.use(sanitizeBody())

// --- Documentacion Swagger ---
setupSwagger(app)

// --- Ruta raiz ---
app.get('/', (req, res) => {
    res.json({
        description: 'Proyecto Sistema de Quejas - API Backend',
        version: '1.0.0',
        authors: [
            {
                name: 'David Chavarria, Michel',
                userGit: '@davidch, @MBL309'
            }
        ],
        documentation: config.docs.urlDocs,
        api_endpoint: config.docs.apiEndpoint,
        environment: config.env
    })
})

// --- Rutas ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.use('/api/reportes', reportesRouter)
app.use('/api/v1', guiaIARouter)

// --- Servir frontend en produccion ---
if (config.env === 'production') {
    const distPath = path.join(__dirname, '../../client/dist')
    app.use(express.static(distPath))
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'))
    })
}

// --- Middleware de error global ---
app.use(errorHandler)

export { httpServer }
