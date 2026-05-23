import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { loginRequest } from '../authService';

vi.mock('axios');

describe('authService', () => {
  it('should return data on successful login', async () => {
    const mockData = { token: '123', usuario: { username: 'admin' } };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const result = await loginRequest('admin', '123456');
    expect(result).toEqual(mockData);
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), {
      username: 'admin',
      password: '123456',
    });
  });

  it('should throw an error on failed login', async () => {
    const mockError = { response: { data: { message: 'Invalid credentials' } } };
    axios.post.mockRejectedValueOnce(mockError);

    await expect(loginRequest('admin', 'wrong')).rejects.toEqual({ message: 'Invalid credentials' });
  });

  it('should throw a default error when response is missing', async () => {
    const mockError = new Error('Network Error');
    axios.post.mockRejectedValueOnce(mockError);

    await expect(loginRequest('admin', 'wrong')).rejects.toEqual({ message: 'Error desconocido' });
  });
});
