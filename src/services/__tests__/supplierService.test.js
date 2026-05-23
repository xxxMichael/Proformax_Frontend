import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getProveedores,
  createProveedor,
  getProveedorById,
  updateProveedor,
  patchProveedor,
  deleteProveedor,
  validarDuplicadoProveedor,
} from '../supplierService';

vi.mock('axios');

describe('supplierService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => 'fake-token');
  });

  const mockData = { data: { success: true, data: [{ id: 1, razonSocial: 'Supplier SA' }] } };

  it('getProveedores should fetch suppliers', async () => {
    axios.get.mockResolvedValueOnce(mockData);
    const result = await getProveedores(1, 10, 'search');
    expect(result).toEqual(mockData.data);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/proveedores'), expect.objectContaining({
      params: { page: 1, limit: 10, search: 'search' }
    }));
  });

  it('createProveedor should create a supplier', async () => {
    axios.post.mockResolvedValueOnce(mockData);
    const result = await createProveedor({ razonSocial: 'Supplier SA' });
    expect(result).toEqual(mockData.data);
  });

  it('getProveedorById should fetch a specific supplier', async () => {
    axios.get.mockResolvedValueOnce(mockData);
    const result = await getProveedorById(1);
    expect(result).toEqual(mockData.data);
  });

  it('updateProveedor should update a supplier', async () => {
    axios.put.mockResolvedValueOnce(mockData);
    const result = await updateProveedor(1, { razonSocial: 'Updated' });
    expect(result).toEqual(mockData.data);
  });

  it('patchProveedor should partially update a supplier', async () => {
    axios.patch.mockResolvedValueOnce(mockData);
    const result = await patchProveedor(1, { razonSocial: 'Patched' });
    expect(result).toEqual(mockData.data);
  });

  it('deleteProveedor should delete a supplier', async () => {
    axios.delete.mockResolvedValueOnce(mockData);
    const result = await deleteProveedor(1);
    expect(result).toEqual(mockData.data);
  });

  it('validarDuplicadoProveedor should find duplicate suppliers', async () => {
    axios.get.mockResolvedValue({ data: { data: [{ id: 1, identificacion: '123' }] } });
    const result = await validarDuplicadoProveedor('123', 'test@test.com');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('should throw correct errors on failure', async () => {
    const errorResponse = { response: { data: { message: 'Custom Error' } } };
    axios.get.mockRejectedValueOnce(errorResponse);
    await expect(getProveedores()).rejects.toEqual({ message: 'Custom Error' });
  });
});
