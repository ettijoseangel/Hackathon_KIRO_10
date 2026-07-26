import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/reporte.model.js', () => ({
  crearReporte: vi.fn(),
  listarReportes: vi.fn(),
  buscarPorCodigo: vi.fn(),
  actualizarEstado: vi.fn(),
}));

vi.mock('../../services/iaClassifier.js', () => ({
  clasificarPrioridad: vi.fn(),
}));

vi.mock('../../services/orientacionIA.service.js', () => ({
  generarYPersistirOrientacion: vi.fn(),
}));

import {
  crearReporte,
  listarReportes,
  buscarPorCodigo,
  actualizarEstado,
} from '../../services/reporte.service.js';

import * as reporteModel from '../../models/reporte.model.js';
import { clasificarPrioridad } from '../../services/iaClassifier.js';
import { generarYPersistirOrientacion } from '../../services/orientacionIA.service.js';

describe('reporte.service.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // generarYPersistirOrientacion retorna una promesa resuelta por defecto
    generarYPersistirOrientacion.mockResolvedValue({});
  });

  // ─── crearReporte ───────────────────────────────────────────────────

  describe('crearReporte', () => {
    const datosValidos = {
      titulo: 'Fuga de agua en la calle',
      areaServicio: 'AGUA',
      categoria: 'INFRAESTRUCTURA',
      tipoUbicacion: 'PUNTO',
      latitud: 25.6866,
      longitud: -100.3161,
      descripcion: 'Hay una fuga grande',
    };

    it('debe rechazar cuando faltan campos obligatorios', async () => {
      const resultado = await crearReporte({});

      expect(resultado.exito).toBe(false);
      expect(resultado.errores).toContain('El campo "titulo" es obligatorio');
      expect(resultado.errores).toContain('El campo "areaServicio" es obligatorio');
      expect(resultado.errores).toContain('El campo "categoria" es obligatorio');
      expect(resultado.errores).toContain('El campo "tipoUbicacion" es obligatorio');
    });

    it('debe rechazar areaServicio invalida', async () => {
      const resultado = await crearReporte({
        ...datosValidos,
        areaServicio: 'INVALIDA',
      });

      expect(resultado.exito).toBe(false);
      expect(resultado.errores[0]).toContain('"areaServicio" debe ser uno de');
    });

    it('debe rechazar categoria invalida', async () => {
      const resultado = await crearReporte({
        ...datosValidos,
        categoria: 'NO_EXISTE',
      });

      expect(resultado.exito).toBe(false);
      expect(resultado.errores[0]).toContain('"categoria" debe ser uno de');
    });

    it('debe rechazar tipoUbicacion invalido', async () => {
      const resultado = await crearReporte({
        ...datosValidos,
        tipoUbicacion: 'LINEA',
      });

      expect(resultado.exito).toBe(false);
      expect(resultado.errores[0]).toContain('"tipoUbicacion" debe ser uno de');
    });

    it('debe rechazar PUNTO sin coordenadas', async () => {
      const resultado = await crearReporte({
        ...datosValidos,
        latitud: undefined,
        longitud: undefined,
      });

      expect(resultado.exito).toBe(false);
      expect(resultado.errores[0]).toContain('"latitud" y "longitud" son obligatorios');
    });

    it('debe rechazar AREA sin direccion', async () => {
      const resultado = await crearReporte({
        ...datosValidos,
        tipoUbicacion: 'AREA',
        latitud: undefined,
        longitud: undefined,
      });

      expect(resultado.exito).toBe(false);
      expect(resultado.errores[0]).toContain('"direccion" es obligatorio');
    });

    it('debe crear un reporte exitosamente con IA y modelo', async () => {
      clasificarPrioridad.mockResolvedValue({
        prioridad: 'ALTA',
        justificacion: 'Fuga activa',
        clasificadoPorIa: true,
      });

      const reporteCreado = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        codigoSeguimiento: 'REP-001',
        ...datosValidos,
        prioridad: 'ALTA',
        estado: 'PENDIENTE',
      };
      reporteModel.crearReporte.mockResolvedValue(reporteCreado);

      const resultado = await crearReporte(datosValidos);

      expect(resultado.exito).toBe(true);
      expect(resultado.reporte).toEqual(reporteCreado);
      expect(clasificarPrioridad).toHaveBeenCalledWith({
        titulo: datosValidos.titulo,
        descripcion: datosValidos.descripcion,
        categoria: datosValidos.categoria,
      });
      expect(reporteModel.crearReporte).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Fuga de agua en la calle',
          prioridad: 'ALTA',
          clasificadoPorIa: true,
        })
      );
      expect(generarYPersistirOrientacion).toHaveBeenCalledWith(reporteCreado);
    });
  });

  // ─── listarReportes ─────────────────────────────────────────────────

  describe('listarReportes', () => {
    it('debe listar reportes sin filtros', async () => {
      reporteModel.listarReportes.mockResolvedValue({
        total: 2,
        reportes: [{ id: '1' }, { id: '2' }],
      });

      const resultado = await listarReportes({});

      expect(resultado.exito).toBe(true);
      expect(resultado.total).toBe(2);
      expect(resultado.reportes).toHaveLength(2);
      expect(reporteModel.listarReportes).toHaveBeenCalledWith({});
    });

    it('debe listar reportes con filtros validos', async () => {
      const filtros = { estado: 'PENDIENTE', areaServicio: 'AGUA' };
      reporteModel.listarReportes.mockResolvedValue({
        total: 1,
        reportes: [{ id: '1' }],
      });

      const resultado = await listarReportes(filtros);

      expect(resultado.exito).toBe(true);
      expect(reporteModel.listarReportes).toHaveBeenCalledWith(filtros);
    });

    it('debe rechazar filtro de estado invalido', async () => {
      const resultado = await listarReportes({ estado: 'INVALIDO' });

      expect(resultado.exito).toBe(false);
      expect(resultado.errores[0]).toContain('"estado" debe ser uno de');
    });

    it('debe rechazar filtro de prioridad invalido', async () => {
      const resultado = await listarReportes({ prioridad: 'MUY_ALTA' });

      expect(resultado.exito).toBe(false);
      expect(resultado.errores[0]).toContain('"prioridad" debe ser uno de');
    });

    it('debe rechazar filtro de areaServicio invalido', async () => {
      const resultado = await listarReportes({ areaServicio: 'PARQUES' });

      expect(resultado.exito).toBe(false);
      expect(resultado.errores[0]).toContain('"areaServicio" debe ser uno de');
    });
  });

  // ─── buscarPorCodigo ────────────────────────────────────────────────

  describe('buscarPorCodigo', () => {
    it('debe rechazar codigo vacio', async () => {
      const resultado = await buscarPorCodigo('');

      expect(resultado.exito).toBe(false);
      expect(resultado.error).toContain('obligatorio');
    });

    it('debe retornar error cuando no se encuentra el codigo', async () => {
      reporteModel.buscarPorCodigo.mockResolvedValue(null);

      const resultado = await buscarPorCodigo('REP-999');

      expect(resultado.exito).toBe(false);
      expect(resultado.error).toContain('No se encontro');
    });

    it('debe retornar el reporte con historial formateado', async () => {
      const fechaCambio = new Date('2025-01-15T10:00:00Z');
      reporteModel.buscarPorCodigo.mockResolvedValue({
        id: '123',
        titulo: 'Fuga',
        codigoSeguimiento: 'REP-001',
        historialEstados: [
          {
            estadoAnterior: 'PENDIENTE',
            estadoNuevo: 'EN_PROCESO',
            changedAt: fechaCambio,
          },
        ],
      });

      const resultado = await buscarPorCodigo('REP-001');

      expect(resultado.exito).toBe(true);
      expect(resultado.reporte.historial).toEqual([
        {
          estado_anterior: 'PENDIENTE',
          estado_nuevo: 'EN_PROCESO',
          changed_at: fechaCambio,
        },
      ]);
      // historialEstados no debe estar en la respuesta
      expect(resultado.reporte.historialEstados).toBeUndefined();
    });
  });

  // ─── actualizarEstado ───────────────────────────────────────────────

  describe('actualizarEstado', () => {
    it('debe rechazar UUID invalido', async () => {
      const resultado = await actualizarEstado('no-es-uuid', 'EN_PROCESO');

      expect(resultado.exito).toBe(false);
      expect(resultado.error).toContain('UUID valido');
    });

    it('debe rechazar estado invalido', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const resultado = await actualizarEstado(uuid, 'ELIMINADO');

      expect(resultado.exito).toBe(false);
      expect(resultado.error).toContain('"estado" debe ser uno de');
    });

    it('debe retornar error cuando el id no existe', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      reporteModel.actualizarEstado.mockResolvedValue(null);

      const resultado = await actualizarEstado(uuid, 'EN_PROCESO');

      expect(resultado.exito).toBe(false);
      expect(resultado.error).toContain('No se encontro');
    });

    it('debe actualizar el estado exitosamente', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const reporteActualizado = {
        id: uuid,
        estado: 'EN_PROCESO',
        titulo: 'Fuga',
      };
      reporteModel.actualizarEstado.mockResolvedValue(reporteActualizado);

      const resultado = await actualizarEstado(uuid, 'EN_PROCESO');

      expect(resultado.exito).toBe(true);
      expect(resultado.reporte).toEqual(reporteActualizado);
      expect(reporteModel.actualizarEstado).toHaveBeenCalledWith(uuid, 'EN_PROCESO');
    });
  });
});
