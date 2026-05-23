import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getProductos,
  createProducto,
  getProductoById,
  updateProducto,
  patchProducto,
  deleteProducto,
  validarDuplicadoProducto,
} from '../productService';

vi.mock('axios');

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => 'fake-token');
  });

  const mockData = { data: { success: true, data: [{ id: 1, nombre: 'Test Product' }] } };

  it('getProductos should fetch products', async () => {
    axios.get.mockResolvedValueOnce(mockData);
    const result = await getProductos(1, 10, 'search', 'producto');
    expect(result).toEqual(mockData.data);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/productos'), expect.objectContaining({
      params: { page: 1, limit: 10, search: 'search', tipo: 'producto' },
      headers: expect.objectContaining({ Authorization: 'Bearer fake-token' })
    }));
  });

  it('createProducto should create a product', async () => {
    axios.post.mockResolvedValueOnce(mockData);
    const result = await createProducto({ nombre: 'Test Product' });
    expect(result).toEqual(mockData.data);
  });

  it('getProductoById should fetch a specific product', async () => {
    axios.get.mockResolvedValueOnce(mockData);
    const result = await getProductoById(1);
    expect(result).toEqual(mockData.data);
  });

  it('updateProducto should update a product', async () => {
    axios.put.mockResolvedValueOnce(mockData);
    const result = await updateProducto(1, { nombre: 'Updated' });
    expect(result).toEqual(mockData.data);
  });

  it('patchProducto should partially update a product', async () => {
    axios.patch.mockResolvedValueOnce(mockData);
    const result = await patchProducto(1, { nombre: 'Patched' });
    expect(result).toEqual(mockData.data);
  });

  it('deleteProducto should delete a product', async () => {
    axios.delete.mockResolvedValueOnce(mockData);
    const result = await deleteProducto(1);
    expect(result).toEqual(mockData.data);
  });

  it('validarDuplicadoProducto should validate duplicate product', async () => {
    axios.get.mockResolvedValue({ data: { data: [{ id: 1, codigo: '123' }] } });
    const result = await validarDuplicadoProducto('123');
    expect(result).toHaveLength(1);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/productos'), expect.objectContaining({
      params: { search: '123', limit: 5 }
    }));
  });

  it('should throw correct errors on failure', async () => {
    const errorResponse = { response: { data: { message: 'Custom Error' } } };
    axios.get.mockRejectedValueOnce(errorResponse);
    await expect(getProductos()).rejects.toEqual({ message: 'Custom Error' });
  });
});
