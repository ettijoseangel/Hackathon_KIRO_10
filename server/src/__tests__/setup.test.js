import { describe, it, expect } from 'vitest'

describe('Vitest Setup', () => {
  it('debe ejecutarse correctamente', () => {
    expect(true).toBe(true)
  })

  it('debe realizar operaciones matemáticas básicas', () => {
    expect(1 + 1).toBe(2)
    expect(3 * 4).toBe(12)
  })

  it('debe manejar strings correctamente', () => {
    const saludo = 'Hola Monterrey'
    expect(saludo).toContain('Monterrey')
    expect(saludo).toHaveLength(14)
  })
})
