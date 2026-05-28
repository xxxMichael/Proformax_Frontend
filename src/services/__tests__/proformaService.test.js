import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getProformas,
  getProformaById,
  createProforma,
  updateProforma,
  updateProformaStatus,
} from '../proformaService';

vi.mock('axios');

describe('proformaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => 'fake-token');
  });

  const mockData = { data: { success: true, data: [{ id: 1, numeroProforma: 'PROF-001' }] } };

  it('getProformas should fetch proformas', async () => {
    axios.get.mockResolvedValueOnce(mockData);
    const result = await getProformas(1, 10, 'search', 'EMITIDA');
    expect(result).toEqual(mockData.data);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/proformas'), expect.objectContaining({
      params: { page: 1, limit: 10, search: 'search', estado: 'EMITIDA' }
    }));
  });

  it('getProformaById should fetch a specific proforma', async () => {
    axios.get.mockResolvedValueOnce(mockData);
    const result = await getProformaById(1);
    expect(result).toEqual(mockData.data);
  });

  it('createProforma should create a proforma', async () => {
    axios.post.mockResolvedValueOnce(mockData);
    const result = await createProforma({ numeroProforma: 'PROF-001' });
    expect(result).toEqual(mockData.data);
  });

  it('updateProforma should update a proforma', async () => {
    axios.put.mockResolvedValueOnce(mockData);
    const result = await updateProforma(1, { numeroProforma: 'PROF-001' });
    expect(result).toEqual(mockData.data);
  });

  it('updateProformaStatus should update proforma status', async () => {
    axios.patch.mockResolvedValueOnce(mockData);
    const result = await updateProformaStatus(1, 'ACEPTADA', 'Aceptada por el cliente');
    expect(result).toEqual(mockData.data);
    expect(axios.patch).toHaveBeenCalledWith(expect.stringContaining('/proformas/1/estado'), {
      estado: 'ACEPTADA',
      observaciones: 'Aceptada por el cliente'
    }, expect.any(Object));
  });

  it('should throw correct errors on failure', async () => {
    const errorResponse = { response: { data: { message: 'Custom Error' } } };
    axios.get.mockRejectedValueOnce(errorResponse);
    await expect(getProformas()).rejects.toEqual({ message: 'Custom Error' });
  });
});
