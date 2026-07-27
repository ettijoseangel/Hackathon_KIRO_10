/**
 * Middleware de sanitizacion XSS.
 * Limpia campos de texto del body para prevenir inyeccion de scripts.
 * Aplica solo a strings — no modifica numeros, booleanos u objetos.
 */
import { filterXSS } from 'xss'

/**
 * Sanitiza recursivamente todos los valores string de un objeto.
 * @param {*} valor - Valor a sanitizar
 * @returns {*} Valor limpio
 */
function sanitizarValor (valor) {
  if (typeof valor === 'string') {
    return filterXSS(valor.trim())
  }
  if (Array.isArray(valor)) {
    return valor.map(sanitizarValor)
  }
  if (valor !== null && typeof valor === 'object') {
    return sanitizarObjeto(valor)
  }
  return valor
}

/**
 * Sanitiza todos los campos string de un objeto.
 * @param {object} obj - Objeto a sanitizar
 * @returns {object} Objeto con strings limpios
 */
function sanitizarObjeto (obj) {
  const resultado = {}
  for (const [clave, valor] of Object.entries(obj)) {
    resultado[clave] = sanitizarValor(valor)
  }
  return resultado
}

/**
 * Middleware Express que sanitiza req.body contra XSS.
 * Debe colocarse DESPUES de express.json() y ANTES de las rutas.
 */
export function sanitizeBody () {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizarObjeto(req.body)
    }
    next()
  }
}
