import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  it('renders user information correctly', () => {
    localStorage.setItem('user', JSON.stringify({ nombres: 'Juan', apellidos: 'Perez', username: 'juanp' }));
    render(<BrowserRouter><Header /></BrowserRouter>);
    
    expect(screen.getByText('Aarte Parquete G y G')).toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    localStorage.setItem('user', JSON.stringify({ nombres: 'Juan' }));
    localStorage.setItem('token', 'fake-token');
    
    render(<BrowserRouter><Header /></BrowserRouter>);
    
    // Primero hacer clic en el perfil para abrir el menú
    const profileTrigger = screen.getByText('Aarte Parquete G y G');
    fireEvent.click(profileTrigger);

    const logoutButton = screen.getByText('Cerrar sesión');
    fireEvent.click(logoutButton);
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
