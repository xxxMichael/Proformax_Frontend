import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { loginRequest, forgotPasswordRequest, resetPasswordRequest } from '../authService';

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

  describe('forgotPasswordRequest', () => {
    it('should return data on successful request', async () => {
      const mockData = { success: true, message: 'Correo enviado' };
      axios.post.mockResolvedValueOnce({ data: mockData });

      const result = await forgotPasswordRequest('test@test.com');
      expect(result).toEqual(mockData);
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/forgot-password'), {
        email: 'test@test.com',
      });
    });

    it('should throw an error on failed request', async () => {
      const mockError = { response: { data: { message: 'Error al enviar' } } };
      axios.post.mockRejectedValueOnce(mockError);

      await expect(forgotPasswordRequest('test@test.com')).rejects.toEqual({ message: 'Error al enviar' });
    });
  });

  describe('resetPasswordRequest', () => {
    it('should return data on successful password reset', async () => {
      const mockData = { success: true, message: 'Contraseña actualizada' };
      axios.post.mockResolvedValueOnce({ data: mockData });

      const result = await resetPasswordRequest('token123', 'newpass');
      expect(result).toEqual(mockData);
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/reset-password'), {
        token: 'token123',
        password: 'newpass',
      });
    });

    it('should throw an error on invalid token', async () => {
      const mockError = { response: { data: { message: 'Token expirado' } } };
      axios.post.mockRejectedValueOnce(mockError);

      await expect(resetPasswordRequest('badtoken', 'newpass')).rejects.toEqual({ message: 'Token expirado' });
    });
  });
});
