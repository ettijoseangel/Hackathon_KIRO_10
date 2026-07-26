import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../ia/index.js', () => ({
  clasificarPrioridad: vi.fn(),
}));

import { clasificarPrioridad } from '../../services/iaClassifier.js';
import { clasificarPrioridad as clasificarMock } from '../../ia/index.js';

describe('iaClassifier.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe delegar la clasificacion al modulo ia/index.js', async () => {
    const mockResultado = {
      prioridad: 'ALTA',
      justificacion: 'Problema urgente de infraestructura',
      clasificadoPorIa: true,
    };
    clasificarMock.mockResolvedValue(mockResultado);

    const params = {
      titulo: 'Fuga de agua',
      descripcion: 'Hay una fuga en la calle principal',
      categoria: 'INFRAESTRUCTURA',
    };

    const resultado = await clasificarPrioridad(params);

    expect(clasificarMock).toHaveBeenCalledWith(params);
    expect(resultado).toEqual(mockResultado);
  });

  it('debe retornar el fallback cuando ia/index.js devuelve fallback', async () => {
    const fallback = {
      prioridad: 'MEDIA',
      justificacion: null,
      clasificadoPorIa: false,
    };
    clasificarMock.mockResolvedValue(fallback);

    const params = {
      titulo: 'Bache en la calle',
      descripcion: '',
      categoria: 'BACHEO',
    };

    const resultado = await clasificarPrioridad(params);

    expect(resultado).toEqual(fallback);
  });

  it('debe propagar errores del modulo IA', async () => {
    clasificarMock.mockRejectedValue(new Error('Error de red'));

    const params = {
      titulo: 'Test',
      descripcion: 'Desc',
      categoria: 'OTRO',
    };

    await expect(clasificarPrioridad(params)).rejects.toThrow('Error de red');
  });
});
