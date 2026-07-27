/**
 * Instancia unica de PrismaClient.
 * Evita multiples conexiones durante hot-reload en desarrollo.
 * Ref: basedatos.md seccion 2.
 */
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error']
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
