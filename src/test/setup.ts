import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Mock de alert para evitar errores en tests
global.alert = vi.fn()

afterEach(() => {
  cleanup()
})
