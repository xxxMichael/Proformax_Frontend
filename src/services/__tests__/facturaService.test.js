import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getFacturas,
  getFacturaById,
  analizarFactura,
  confirmarFactura,
} from '../facturaService';

vi.mock('axios');

describe('facturaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => 'fake-token');
  });

  const mockData = { data: { success: true, data: [{ id: 1, numeroFactura: '001-001' }] } };

  it('getFacturas should fetch facturas', async () => {
    axios.get.mockResolvedValueOnce(mockData);
    const result = await getFacturas(1, 10, '2');
    expect(result).toEqual(mockData.data);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/facturas'), expect.objectContaining({
      params: { page: 1, limit: 10, proveedorId: '2' }
    }));
  });

  it('getFacturaById should fetch a specific factura', async () => {
    axios.get.mockResolvedValueOnce(mockData);
    const result = await getFacturaById(1);
    expect(result).toEqual(mockData.data);
  });

  it('analizarFactura should upload file and analyze', async () => {
    const mockAnalysis = { data: { datosExtraidos: { total: 100 } } };
    axios.post.mockResolvedValueOnce(mockAnalysis);
    
    const fakeFile = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    const result = await analizarFactura(fakeFile);
    
    expect(result).toEqual(mockAnalysis.data);
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/facturas/analizar'), expect.any(FormData), expect.objectContaining({
      headers: expect.objectContaining({
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer fake-token'
      })
    }));
  });

  it('confirmarFactura should confirm and save a factura', async () => {
    axios.post.mockResolvedValueOnce(mockData);
    const result = await confirmarFactura({ proveedorId: 1, total: 100 });
    expect(result).toEqual(mockData.data);
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/facturas/confirmar'), { proveedorId: 1, total: 100 }, expect.any(Object));
  });

  it('should throw correct errors on failure', async () => {
    const errorResponse = { response: { data: { message: 'Custom Error' } } };
    axios.get.mockRejectedValueOnce(errorResponse);
    await expect(getFacturas()).rejects.toEqual({ message: 'Custom Error' });
  });
});
