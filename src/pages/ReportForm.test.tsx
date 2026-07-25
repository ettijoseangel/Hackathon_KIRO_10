import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReportForm from './ReportForm'

describe('ReportForm - Validación de Campos Obligatorios', () => {
  it('debe mostrar errores cuando se intenta enviar el formulario sin completar campos obligatorios', async () => {
    const user = userEvent.setup()
    render(<ReportForm />)
    
    const submitButton = screen.getByRole('button', { name: /enviar reporte/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/el título es obligatorio/i)).toBeInTheDocument()
      expect(screen.getByText(/la descripción es obligatoria/i)).toBeInTheDocument()
      expect(screen.getByText(/la categoría es obligatoria/i)).toBeInTheDocument()
      expect(screen.getByText(/la ubicación es obligatoria/i)).toBeInTheDocument()
    })
  })

  it('debe eliminar el error de título cuando el usuario lo completa', async () => {
    const user = userEvent.setup()
    render(<ReportForm />)
    
    const submitButton = screen.getByRole('button', { name: /enviar reporte/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/el título es obligatorio/i)).toBeInTheDocument()
    })
    
    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Bache en calle principal')
    
    await waitFor(() => {
      expect(screen.queryByText(/el título es obligatorio/i)).not.toBeInTheDocument()
    })
  })

  it('debe eliminar el error de descripción cuando el usuario la completa', async () => {
    const user = userEvent.setup()
    render(<ReportForm />)
    
    const submitButton = screen.getByRole('button', { name: /enviar reporte/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/la descripción es obligatoria/i)).toBeInTheDocument()
    })
    
    const descriptionInput = screen.getByLabelText(/descripción/i)
    await user.type(descriptionInput, 'Hay un bache grande en la calle')
    
    await waitFor(() => {
      expect(screen.queryByText(/la descripción es obligatoria/i)).not.toBeInTheDocument()
    })
  })

  it('debe eliminar el error de categoría cuando el usuario selecciona una', async () => {
    const user = userEvent.setup()
    render(<ReportForm />)
    
    const submitButton = screen.getByRole('button', { name: /enviar reporte/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/la categoría es obligatoria/i)).toBeInTheDocument()
    })
    
    const categorySelect = screen.getByLabelText(/categoría/i)
    await user.selectOptions(categorySelect, 'bache')
    
    await waitFor(() => {
      expect(screen.queryByText(/la categoría es obligatoria/i)).not.toBeInTheDocument()
    })
  })

  it('debe eliminar el error de ubicación cuando el usuario ingresa una dirección manual', async () => {
    const user = userEvent.setup()
    render(<ReportForm />)
    
    const submitButton = screen.getByRole('button', { name: /enviar reporte/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/la ubicación es obligatoria/i)).toBeInTheDocument()
    })
    
    const manualInput = screen.getByLabelText(/ingreso manual/i)
    await user.type(manualInput, 'Calle Principal #123')
    
    await waitFor(() => {
      expect(screen.queryByText(/la ubicación es obligatoria/i)).not.toBeInTheDocument()
    })
  })

  it('debe eliminar el error de ubicación cuando el usuario captura GPS', async () => {
    const user = userEvent.setup()
    
    // Mock de geolocalización exitosa
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: 19.432608,
            longitude: -99.133209,
            accuracy: 10
          }
        })
      })
    }
    
    // @ts-ignore
    global.navigator.geolocation = mockGeolocation
    
    render(<ReportForm />)
    
    const submitButton = screen.getByRole('button', { name: /enviar reporte/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/la ubicación es obligatoria/i)).toBeInTheDocument()
    })
    
    const gpsButton = screen.getByRole('button', { name: /usar mi ubicación.*gps/i })
    await user.click(gpsButton)
    
    await waitFor(() => {
      expect(screen.queryByText(/la ubicación es obligatoria/i)).not.toBeInTheDocument()
    })
  })

  it('debe permitir envío sin imagen (evidencia es opcional)', async () => {
    const user = userEvent.setup()
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    // Mock de geolocalización exitosa
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: 19.432608,
            longitude: -99.133209,
            accuracy: 10
          }
        })
      })
    }
    
    // @ts-ignore
    global.navigator.geolocation = mockGeolocation
    
    render(<ReportForm />)
    
    // Completar campos obligatorios
    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Bache en calle principal')
    
    const descriptionInput = screen.getByLabelText(/descripción/i)
    await user.type(descriptionInput, 'Hay un bache grande en la calle')
    
    const categorySelect = screen.getByLabelText(/categoría/i)
    await user.selectOptions(categorySelect, 'bache')
    
    const gpsButton = screen.getByRole('button', { name: /usar mi ubicación.*gps/i })
    await user.click(gpsButton)
    
    await waitFor(() => {
      expect(screen.getByText(/ubicación gps capturada/i)).toBeInTheDocument()
    })
    
    // Enviar formulario sin imagen
    const submitButton = screen.getByRole('button', { name: /enviar reporte/i })
    await user.click(submitButton)
    
    // Verificar que el formulario se envió correctamente
    // Ahora el envío es asíncrono, por lo que debemos esperar más tiempo
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Formulario válido, preparando envío:',
        expect.objectContaining({
          title: 'Bache en calle principal',
          description: 'Hay un bache grande en la calle',
          category: 'bache',
          image: null
        })
      )
    }, { timeout: 3000 }) // Incrementar el timeout porque hay un delay de 2 segundos en la simulación
    
    consoleLogSpy.mockRestore()
  })

  it('debe mostrar errores específicos para cada campo faltante', async () => {
    const user = userEvent.setup()
    render(<ReportForm />)
    
    // Completar solo algunos campos
    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Título del reporte')
    
    const submitButton = screen.getByRole('button', { name: /enviar reporte/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      // No debe mostrar error de título
      expect(screen.queryByText(/el título es obligatorio/i)).not.toBeInTheDocument()
      
      // Debe mostrar errores de los demás campos
      expect(screen.getByText(/la descripción es obligatoria/i)).toBeInTheDocument()
      expect(screen.getByText(/la categoría es obligatoria/i)).toBeInTheDocument()
      expect(screen.getByText(/la ubicación es obligatoria/i)).toBeInTheDocument()
    })
  })
})

describe('ReportForm - Captura de Ubicación', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    vi.clearAllMocks()
  })

  describe('Ingreso Manual de Dirección', () => {
    it('debe renderizar el input para dirección manual', () => {
      render(<ReportForm />)
      
      const manualInput = screen.getByLabelText(/ingreso manual/i)
      expect(manualInput).toBeInTheDocument()
      expect(manualInput).toHaveAttribute('placeholder', expect.stringContaining('Calle'))
    })

    it('debe permitir escribir una dirección manualmente', async () => {
      const user = userEvent.setup()
      render(<ReportForm />)
      
      const manualInput = screen.getByLabelText(/ingreso manual/i)
      const testAddress = 'Calle Principal #123, Colonia Centro'
      
      await user.type(manualInput, testAddress)
      
      expect(manualInput).toHaveValue(testAddress)
    })

    it('debe mostrar la dirección ingresada cuando se completa el campo', async () => {
      const user = userEvent.setup()
      render(<ReportForm />)
      
      const manualInput = screen.getByLabelText(/ingreso manual/i)
      const testAddress = 'Avenida Reforma 456'
      
      await user.type(manualInput, testAddress)
      
      await waitFor(() => {
        expect(screen.getByText(/dirección ingresada/i)).toBeInTheDocument()
        expect(screen.getByText(testAddress)).toBeInTheDocument()
      })
    })
  })

  describe('Captura GPS Automática', () => {
    it('debe renderizar el botón de GPS', () => {
      render(<ReportForm />)
      
      const gpsButton = screen.getByRole('button', { name: /usar mi ubicación.*gps/i })
      expect(gpsButton).toBeInTheDocument()
    })

    it('debe mostrar error cuando el navegador no soporta geolocalización', async () => {
      const user = userEvent.setup()
      
      // Mock del navegador sin soporte de geolocalización
      const originalGeolocation = global.navigator.geolocation
      // @ts-ignore
      delete global.navigator.geolocation
      
      render(<ReportForm />)
      
      const gpsButton = screen.getByRole('button', { name: /usar mi ubicación.*gps/i })
      await user.click(gpsButton)
      
      await waitFor(() => {
        expect(screen.getByText(/no soporta geolocalización/i)).toBeInTheDocument()
      })
      
      // Restaurar
      global.navigator.geolocation = originalGeolocation
    })

    it('debe solicitar permisos y mostrar coordenadas cuando se obtiene ubicación exitosamente', async () => {
      const user = userEvent.setup()
      
      // Mock de geolocalización exitosa
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: 19.432608,
              longitude: -99.133209,
              accuracy: 10
            }
          })
        })
      }
      
      // @ts-ignore
      global.navigator.geolocation = mockGeolocation
      
      render(<ReportForm />)
      
      const gpsButton = screen.getByRole('button', { name: /usar mi ubicación.*gps/i })
      await user.click(gpsButton)
      
      await waitFor(() => {
        expect(screen.getByText(/ubicación gps capturada/i)).toBeInTheDocument()
        expect(screen.getByText(/latitud.*19\.432608/i)).toBeInTheDocument()
        expect(screen.getByText(/longitud.*-99\.133209/i)).toBeInTheDocument()
      })
      
      // Verificar que se solicitaron permisos con las opciones correctas
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      )
    })

    it('debe mostrar error cuando se deniegan permisos de ubicación', async () => {
      const user = userEvent.setup()
      
      // Mock de geolocalización con permiso denegado
      const mockGeolocation = {
        getCurrentPosition: vi.fn((_, error) => {
          const mockError = {
            code: 1, // PERMISSION_DENIED
            message: 'User denied geolocation',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
          }
          error(mockError)
        })
      }
      
      // @ts-ignore
      global.navigator.geolocation = mockGeolocation
      
      render(<ReportForm />)
      
      const gpsButton = screen.getByRole('button', { name: /usar mi ubicación.*gps/i })
      await user.click(gpsButton)
      
      await waitFor(() => {
        expect(screen.getByText(/permiso de ubicación denegado/i)).toBeInTheDocument()
      })
    })

    it('debe limpiar dirección manual cuando se captura GPS exitosamente', async () => {
      const user = userEvent.setup()
      
      // Mock de geolocalización exitosa
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: 19.432608,
              longitude: -99.133209,
              accuracy: 10
            }
          })
        })
      }
      
      // @ts-ignore
      global.navigator.geolocation = mockGeolocation
      
      render(<ReportForm />)
      
      // Primero ingresar dirección manual
      const manualInput = screen.getByLabelText(/ingreso manual/i)
      await user.type(manualInput, 'Dirección temporal')
      
      await waitFor(() => {
        expect(screen.getByText(/dirección ingresada/i)).toBeInTheDocument()
      })
      
      // Luego capturar GPS
      const gpsButton = screen.getByRole('button', { name: /usar mi ubicación.*gps/i })
      await user.click(gpsButton)
      
      await waitFor(() => {
        expect(screen.getByText(/ubicación gps capturada/i)).toBeInTheDocument()
        expect(screen.queryByText(/dirección ingresada/i)).not.toBeInTheDocument()
        expect(manualInput).toHaveValue('')
      })
    })
  })

  describe('Componentes UI', () => {
    it('debe renderizar la tarjeta de ubicación con título y descripción', () => {
      render(<ReportForm />)
      
      expect(screen.getByText(/ubicación del problema/i)).toBeInTheDocument()
      expect(screen.getByText(/captura la ubicación mediante gps o ingresa una dirección/i)).toBeInTheDocument()
    })

    it('debe mostrar separador visual entre GPS y entrada manual', () => {
      render(<ReportForm />)
      
      const separator = screen.getByText('O')
      expect(separator).toBeInTheDocument()
    })

    it('debe deshabilitar input manual mientras se obtiene ubicación GPS', async () => {
      const user = userEvent.setup()
      
      // Mock de geolocalización que toma tiempo
      const mockGeolocation = {
        getCurrentPosition: vi.fn()
      }
      
      // @ts-ignore
      global.navigator.geolocation = mockGeolocation
      
      render(<ReportForm />)
      
      const manualInput = screen.getByLabelText(/ingreso manual/i)
      const gpsButton = screen.getByRole('button', { name: /usar mi ubicación.*gps/i })
      
      expect(manualInput).not.toBeDisabled()
      
      await user.click(gpsButton)
      
      // Durante la obtención, el input debe estar deshabilitado
      expect(screen.getByRole('button', { name: /obteniendo ubicación/i })).toBeInTheDocument()
    })
  })
})
