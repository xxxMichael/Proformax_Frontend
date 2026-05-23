import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getClientes,
  createCliente,
  getClienteById,
  updateCliente,
  patchCliente,
  deleteCliente,
  validarDuplicadoCliente,
} from '../clientService';

vi.mock('axios');

describe('clientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => 'fake-token');
  });

  const mockData = { data: { success: true, data: [{ id: 1, nombres: 'Test' }] } };

  it('getClientes should fetch clients', async () => {
    axios.get.mockResolvedValueOnce(mockData);
    const result = await getClientes(1, 10, 'search');
    expect(result).toEqual(mockData.data);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/clientes'), expect.objectContaining({
      params: { page: 1, limit: 10, search: 'search' },
      headers: expect.objectContaining({ Authorization: 'Bearer fake-token' })
    }));
  });

  it('createCliente should create a client', async () => {
    axios.post.mockResolvedValueOnce(mockData);
    const result = await createCliente({ nombres: 'Test' });
    expect(result).toEqual(mockData.data);
  });

  it('getClienteById should fetch a specific client', async () => {
    axios.get.mockResolvedValueOnce(mockData);
    const result = await getClienteById(1);
    expect(result).toEqual(mockData.data);
  });

  it('updateCliente should update a client', async () => {
    axios.put.mockResolvedValueOnce(mockData);
    const result = await updateCliente(1, { nombres: 'Updated' });
    expect(result).toEqual(mockData.data);
  });

  it('patchCliente should partially update a client', async () => {
    axios.patch.mockResolvedValueOnce(mockData);
    const result = await patchCliente(1, { nombres: 'Patched' });
    expect(result).toEqual(mockData.data);
  });

  it('deleteCliente should delete a client', async () => {
    axios.delete.mockResolvedValueOnce(mockData);
    const result = await deleteCliente(1);
    expect(result).toEqual(mockData.data);
  });

  it('validarDuplicadoCliente should find duplicate clients', async () => {
    axios.get.mockResolvedValue({ data: { data: [{ id: 1, identificacion: '123' }] } });
    const result = await validarDuplicadoCliente('123', 'test@test.com');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('should throw correct errors on failure', async () => {
    const errorResponse = { response: { data: { message: 'Custom Error' } } };
    axios.get.mockRejectedValueOnce(errorResponse);
    await expect(getClientes()).rejects.toEqual({ message: 'Custom Error' });
  });
});
