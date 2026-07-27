/**
 * Middleware de seguridad HTTP.
 * Agrega headers protectores contra ataques comunes:
 * - X-Content-Type-Options (previene MIME sniffing)
 * - X-Frame-Options (previene clickjacking)
 * - Strict-Transport-Security (fuerza HTTPS)
 * - X-XSS-Protection (filtro XSS del navegador)
 * - Content-Security-Policy (controla recursos permitidos)
 */
import helmet from 'helmet';

export function securityHeaders() {
  return helmet();
}
