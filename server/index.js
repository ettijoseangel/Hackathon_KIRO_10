import { config } from './src/config/config.js'
import { httpServer } from './src/server.js'

async function startServer() {
    await new Promise((resolve) => httpServer.listen(config.port, '0.0.0.0', resolve))

    console.log(`Servidor iniciado en puerto: ${config.port}`)
    console.log(`Entorno: ${config.env}`)
    console.log(`Documentacion: ${config.docs.urlDocs}`)

    if (config.env === 'production') {
        console.log('Modo produccion activo')
    } else {
        console.log(`URL local: http://localhost:${config.port}`)
    }
}

startServer()
    .catch(error => console.error('Error al iniciar el servidor:', error))
