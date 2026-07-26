import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../ia/index.js', () => ({
  generarOrientacion: vi.fn(),
}));

vi.mock('../../models/orientacionIA.model.js', () => ({
  crearOrientacion: vi.fn(),
  buscarPorReporteId: vi.fn(),
}));

import {
  generarYPersistirOrientacion,
  obtenerOrientacionPorReporte,
} from '../../services/orientacionIA.service.js';

import * as iaProvider from '../../ia/index.js';
import * as orientacionModel from '../../models/orientacionIA.model.js';

describe('orientacionIA.service.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── generarYPersistirOrientacion ───────────────────────────────────

  describe('generarYPersistirOrientacion', () => {
    const reporteMock = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      titulo: 'Fuga de agua',
      descripcion: 'En la calle Morelos',
      categoria: 'INFRAESTRUCTURA',
      municipio: 'San Nicolas',
    };

    it('debe construir el input correcto, llamar a la IA y persistir', async () => {
      const resultadoIA = {
        institucionNombre: 'Servicios de Agua de NL',
        institucionDescripcion: 'Empresa de agua',
        institucionSitioWeb: 'https://agua.nl.gob.mx',
        confianza: 0.85,
        mediosContacto: [{ tipo: 'telefono', valor: '8181234567' }],
        proximosPasos: ['Llamar', 'Esperar'],
        requiereMasInformacion: false,
        mensajeFallback: null,
        modeloIA: 'claude-sonnet-4-20250514',
      };
      iaProvider.generarOrientacion.mockResolvedValue(resultadoIA);

      const orientacionCreada = {
        id: 'orient-001',
        reporteId: reporteMock.id,
        ...resultadoIA,
      };
      orientacionModel.crearOrientacion.mockResolvedValue(orientacionCreada);

      const resultado = await generarYPersistirOrientacion(reporteMock);

      // Verificar que construyo el input correctamente
      expect(iaProvider.generarOrientacion).toHaveBeenCalledWith({
        reporteId: reporteMock.id,
        descripcionQueja: 'Fuga de agua. En la calle Morelos',
        categoria: 'INFRAESTRUCTURA',
        ubicacion: {
          pais: 'Mexico',
          provincia_estado: 'Nuevo Leon',
          ciudad: 'San Nicolas',
        },
      });

      // Verificar que persiste con reporteId + resultado IA
      expect(orientacionModel.crearOrientacion).toHaveBeenCalledWith({
        reporteId: reporteMock.id,
        ...resultadoIA,
      });

      expect(resultado).toEqual(orientacionCreada);
    });

    it('debe usar "Monterrey" como ciudad por defecto si no hay municipio', async () => {
      const reporteSinMunicipio = { ...reporteMock, municipio: undefined };
      iaProvider.generarOrientacion.mockResolvedValue({});
      orientacionModel.crearOrientacion.mockResolvedValue({});

      await generarYPersistirOrientacion(reporteSinMunicipio);

      expect(iaProvider.generarOrientacion).toHaveBeenCalledWith(
        expect.objectContaining({
          ubicacion: expect.objectContaining({
            ciudad: 'Monterrey',
          }),
        })
      );
    });

    it('debe manejar descripcion nula en el reporte', async () => {
      const reporteSinDesc = { ...reporteMock, descripcion: null };
      iaProvider.generarOrientacion.mockResolvedValue({});
      orientacionModel.crearOrientacion.mockResolvedValue({});

      await generarYPersistirOrientacion(reporteSinDesc);

      expect(iaProvider.generarOrientacion).toHaveBeenCalledWith(
        expect.objectContaining({
          descripcionQueja: 'Fuga de agua.',
        })
      );
    });
  });

  // ─── obtenerOrientacionPorReporte ───────────────────────────────────

  describe('obtenerOrientacionPorReporte', () => {
    it('debe rechazar UUID invalido', async () => {
      const resultado = await obtenerOrientacionPorReporte('no-es-uuid');

      expect(resultado.exito).toBe(false);
      expect(resultado.error).toContain('UUID valido');
    });

    it('debe rechazar reporteId vacio', async () => {
      const resultado = await obtenerOrientacionPorReporte('');

      expect(resultado.exito).toBe(false);
      expect(resultado.error).toContain('UUID valido');
    });

    it('debe retornar error cuando no existe orientacion', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      orientacionModel.buscarPorReporteId.mockResolvedValue(null);

      const resultado = await obtenerOrientacionPorReporte(uuid);

      expect(resultado.exito).toBe(false);
      expect(resultado.error).toContain('No se encontro orientacion');
    });

    it('debe retornar la orientacion formateada correctamente', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const fechaCreacion = new Date('2025-01-15T10:00:00Z');
      orientacionModel.buscarPorReporteId.mockResolvedValue({
        reporteId: uuid,
        institucionNombre: 'SADM',
        institucionDescripcion: 'Servicios de Agua y Drenaje',
        institucionSitioWeb: 'https://sadm.gob.mx',
        confianza: 0.9,
        mediosContacto: [{ tipo: 'telefono', valor: '8181818181' }],
        proximosPasos: ['Llamar al 073'],
        requiereMasInformacion: false,
        mensajeFallback: null,
        createdAt: fechaCreacion,
      });

      const resultado = await obtenerOrientacionPorReporte(uuid);

      expect(resultado.exito).toBe(true);
      expect(resultado.orientacion).toEqual({
        reporte_id: uuid,
        resumen_queja: 'Reporte orientado a: SADM',
        categoria: null,
        institucion: {
          nombre: 'SADM',
          descripcion: 'Servicios de Agua y Drenaje',
          sitio_web: 'https://sadm.gob.mx',
          confianza: 0.9,
        },
        medios_contacto: [{ tipo: 'telefono', valor: '8181818181' }],
        pasos_siguientes: ['Llamar al 073'],
        requiere_mas_informacion: false,
        pregunta_aclaratoria: null,
        timestamp: '2025-01-15T10:00:00.000Z',
      });
    });
  });
});
