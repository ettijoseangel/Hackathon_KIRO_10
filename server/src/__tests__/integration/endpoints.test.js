/**
 * Tests de integracion para los endpoints de la API.
 * Usa supertest para hacer requests HTTP reales contra la app Express.
 * Los modelos y el modulo IA se mockean para no depender de una BD real.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// --- Mocks de modelos y modulo IA ---

vi.mock('../../models/reporte.model.js', () => ({
  crearReporte: vi.fn(),
  listarReportes: vi.fn(),
  buscarPorCodigo: vi.fn(),
  buscarPorId: vi.fn(),
  actualizarEstado: vi.fn(),
}));

vi.mock('../../models/orientacionIA.model.js', () => ({
  crearOrientacion: vi.fn(),
  buscarPorReporteId: vi.fn(),
}));

vi.mock('../../ia/index.js', () => ({
  clasificarPrioridad: vi.fn(),
  generarOrientacion: vi.fn(),
}));

import app from '../../app.js';
import * as reporteModel from '../../models/reporte.model.js';
import * as orientacionModel from '../../models/orientacionIA.model.js';
import * as iaModule from '../../ia/index.js';

// --- Datos mock reutilizables ---

const reporteMock = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  codigoSeguimiento: 'REP-001',
  titulo: 'Fuga de agua en Col. Centro',
  descripcion: 'Hay una fuga grande en la esquina',
  areaServicio: 'AGUA',
  categoria: 'INFRAESTRUCTURA',
  prioridad: 'ALTA',
  estado: 'PENDIENTE',
  tipoUbicacion: 'PUNTO',
  latitud: 25.6866,
  longitud: -100.3161,
  direccion: null,
  colonia: 'Centro',
  municipio: 'Monterrey',
  fotoUrl: null,
  contactoEmail: 'test@email.com',
  contactoTelefono: null,
  justificacionIa: 'Fuga activa requiere atencion inmediata',
  clasificadoPorIa: true,
  createdAt: new Date('2025-01-15T10:00:00Z'),
  updatedAt: new Date('2025-01-15T10:00:00Z'),
};

const datosCreacionValidos = {
  titulo: 'Fuga de agua en Col. Centro',
  descripcion: 'Hay una fuga grande en la esquina',
  areaServicio: 'AGUA',
  categoria: 'INFRAESTRUCTURA',
  tipoUbicacion: 'PUNTO',
  latitud: 25.6866,
  longitud: -100.3161,
  colonia: 'Centro',
  municipio: 'Monterrey',
  contactoEmail: 'test@email.com',
};

describe('Endpoints - Tests de integracion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Defaults para evitar unhandled rejections del flujo no-bloqueante
    iaModule.clasificarPrioridad.mockResolvedValue({
      prioridad: 'ALTA',
      justificacion: 'Fuga activa requiere atencion inmediata',
      clasificadoPorIa: true,
    });
    iaModule.generarOrientacion.mockResolvedValue({
      institucionNombre: 'SADM',
      institucionDescripcion: 'Servicios de Agua',
      institucionSitioWeb: 'https://sadm.gob.mx',
      confianza: 0.85,
      mediosContacto: [],
      proximosPasos: [],
      requiereMasInformacion: false,
      mensajeFallback: null,
      modeloIA: 'claude-sonnet-4-20250514',
    });
    orientacionModel.crearOrientacion.mockResolvedValue({});
  });

  // ═══════════════════════════════════════════════════════════════════════
  // GET /api/health
  // ═══════════════════════════════════════════════════════════════════════

  describe('GET /api/health', () => {
    it('debe retornar 200 con status ok', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // POST /api/reportes
  // ═══════════════════════════════════════════════════════════════════════

  describe('POST /api/reportes', () => {
    it('debe crear un reporte exitosamente y retornar 201', async () => {
      reporteModel.crearReporte.mockResolvedValue(reporteMock);

      const res = await request(app)
        .post('/api/reportes')
        .send(datosCreacionValidos);

      expect(res.status).toBe(201);
      expect(res.body.codigoSeguimiento).toBe('REP-001');
      expect(res.body.titulo).toBe('Fuga de agua en Col. Centro');
      expect(res.body.prioridad).toBe('ALTA');
      expect(reporteModel.crearReporte).toHaveBeenCalled();
    });

    it('debe retornar 400 cuando faltan campos obligatorios', async () => {
      const res = await request(app)
        .post('/api/reportes')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toContain('titulo');
    });

    it('debe retornar 400 con areaServicio invalida', async () => {
      const res = await request(app)
        .post('/api/reportes')
        .send({ ...datosCreacionValidos, areaServicio: 'PARQUES' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('areaServicio');
    });

    it('debe retornar 400 con categoria invalida', async () => {
      const res = await request(app)
        .post('/api/reportes')
        .send({ ...datosCreacionValidos, categoria: 'NO_EXISTE' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('categoria');
    });

    it('debe retornar 400 con tipoUbicacion invalido', async () => {
      const res = await request(app)
        .post('/api/reportes')
        .send({ ...datosCreacionValidos, tipoUbicacion: 'LINEA' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('tipoUbicacion');
    });

    it('debe retornar 400 cuando tipoUbicacion es PUNTO sin coordenadas', async () => {
      const res = await request(app)
        .post('/api/reportes')
        .send({
          ...datosCreacionValidos,
          tipoUbicacion: 'PUNTO',
          latitud: undefined,
          longitud: undefined,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('latitud');
    });

    it('debe retornar 400 cuando tipoUbicacion es AREA sin direccion', async () => {
      const res = await request(app)
        .post('/api/reportes')
        .send({
          titulo: 'Basura acumulada',
          areaServicio: 'RECOLECCION_BASURA',
          categoria: 'LIMPIEZA',
          tipoUbicacion: 'AREA',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('direccion');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // GET /api/reportes
  // ═══════════════════════════════════════════════════════════════════════

  describe('GET /api/reportes', () => {
    it('debe retornar 200 con lista de reportes sin filtros', async () => {
      reporteModel.listarReportes.mockResolvedValue({
        total: 2,
        reportes: [reporteMock, { ...reporteMock, id: 'otro-id' }],
      });

      const res = await request(app).get('/api/reportes');

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.reportes).toHaveLength(2);
    });

    it('debe retornar 200 con filtros validos aplicados', async () => {
      reporteModel.listarReportes.mockResolvedValue({
        total: 1,
        reportes: [reporteMock],
      });

      const res = await request(app)
        .get('/api/reportes')
        .query({ estado: 'PENDIENTE' });

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(reporteModel.listarReportes).toHaveBeenCalledWith(
        expect.objectContaining({ estado: 'PENDIENTE' })
      );
    });

    it('debe retornar 400 con filtro de estado invalido', async () => {
      const res = await request(app)
        .get('/api/reportes')
        .query({ estado: 'INVALIDO' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('estado');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // GET /api/reportes/:codigo
  // ═══════════════════════════════════════════════════════════════════════

  describe('GET /api/reportes/:codigo', () => {
    it('debe retornar 200 con reporte y historial cuando el codigo existe', async () => {
      reporteModel.buscarPorCodigo.mockResolvedValue({
        ...reporteMock,
        historialEstados: [
          {
            estadoAnterior: 'PENDIENTE',
            estadoNuevo: 'EN_PROCESO',
            changedAt: new Date('2025-01-16T10:00:00Z'),
          },
        ],
      });

      const res = await request(app).get('/api/reportes/REP-001');

      expect(res.status).toBe(200);
      expect(res.body.codigoSeguimiento).toBe('REP-001');
      expect(res.body.historial).toBeDefined();
      expect(res.body.historial).toHaveLength(1);
      expect(res.body.historial[0].estado_anterior).toBe('PENDIENTE');
      expect(res.body.historial[0].estado_nuevo).toBe('EN_PROCESO');
    });

    it('debe retornar 404 cuando el codigo no existe', async () => {
      reporteModel.buscarPorCodigo.mockResolvedValue(null);

      const res = await request(app).get('/api/reportes/REP-999');

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('No se encontro');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PATCH /api/reportes/:id/estado
  // ═══════════════════════════════════════════════════════════════════════

  describe('PATCH /api/reportes/:id/estado', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('debe retornar 200 al actualizar estado exitosamente', async () => {
      reporteModel.actualizarEstado.mockResolvedValue({
        ...reporteMock,
        estado: 'EN_PROCESO',
      });

      const res = await request(app)
        .patch(`/api/reportes/${validUUID}/estado`)
        .send({ estado: 'EN_PROCESO' });

      expect(res.status).toBe(200);
      expect(res.body.estado).toBe('EN_PROCESO');
    });

    it('debe retornar 400 cuando el body no contiene estado', async () => {
      const res = await request(app)
        .patch(`/api/reportes/${validUUID}/estado`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('estado');
    });

    it('debe retornar 400 con estado invalido', async () => {
      const res = await request(app)
        .patch(`/api/reportes/${validUUID}/estado`)
        .send({ estado: 'ELIMINADO' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('estado');
    });

    it('debe retornar 404 cuando el id no existe', async () => {
      reporteModel.actualizarEstado.mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/reportes/${validUUID}/estado`)
        .send({ estado: 'EN_PROCESO' });

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('No se encontro');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // GET /api/v1/reportes/:reporteId/guia-ia
  // ═══════════════════════════════════════════════════════════════════════

  describe('GET /api/v1/reportes/:reporteId/guia-ia', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';

    it('debe retornar 200 con orientacion completa', async () => {
      orientacionModel.buscarPorReporteId.mockResolvedValue({
        reporteId: validUUID,
        institucionNombre: 'SADM',
        institucionDescripcion: 'Servicios de Agua y Drenaje',
        institucionSitioWeb: 'https://sadm.gob.mx',
        confianza: 0.9,
        mediosContacto: [{ tipo: 'telefono', valor: '8181818181' }],
        proximosPasos: ['Llamar al 073'],
        requiereMasInformacion: false,
        mensajeFallback: null,
        createdAt: new Date('2025-01-15T10:00:00Z'),
      });

      const res = await request(app)
        .get(`/api/v1/reportes/${validUUID}/guia-ia`);

      expect(res.status).toBe(200);
      expect(res.body.reporte_id).toBe(validUUID);
      expect(res.body.institucion.nombre).toBe('SADM');
      expect(res.body.medios_contacto).toHaveLength(1);
      expect(res.body.pasos_siguientes).toHaveLength(1);
      expect(res.body.requiere_mas_informacion).toBe(false);
    });

    it('debe retornar 206 cuando requiere mas informacion', async () => {
      orientacionModel.buscarPorReporteId.mockResolvedValue({
        reporteId: validUUID,
        institucionNombre: null,
        institucionDescripcion: null,
        institucionSitioWeb: null,
        confianza: null,
        mediosContacto: [],
        proximosPasos: [],
        requiereMasInformacion: true,
        mensajeFallback: 'Se necesita mas informacion para orientar.',
        createdAt: new Date('2025-01-15T10:00:00Z'),
      });

      const res = await request(app)
        .get(`/api/v1/reportes/${validUUID}/guia-ia`);

      expect(res.status).toBe(206);
      expect(res.body.requiere_mas_informacion).toBe(true);
      expect(res.body.pregunta_aclaratoria).toBe('Se necesita mas informacion para orientar.');
    });

    it('debe retornar 400 con UUID invalido', async () => {
      const res = await request(app)
        .get('/api/v1/reportes/no-es-uuid/guia-ia');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('UUID');
    });

    it('debe retornar 404 cuando no existe orientacion para el reporte', async () => {
      orientacionModel.buscarPorReporteId.mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/reportes/${validUUID}/guia-ia`);

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('No se encontro');
    });
  });
});
