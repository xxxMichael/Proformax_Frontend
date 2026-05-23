import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders standard menu items for a non-admin user', () => {
    localStorage.setItem('user', JSON.stringify({ rol: 'VENDEDOR' }));
    renderWithRouter(<Sidebar />);
    
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Proformas')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });

  it('renders Usuarios menu item for ADMIN user', () => {
    localStorage.setItem('user', JSON.stringify({ rol: 'ADMIN' }));
    renderWithRouter(<Sidebar />);
    
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  it('collapses and expands when toggle button is clicked', () => {
    renderWithRouter(<Sidebar />);
    
    const toggleBtn = screen.getByText('☰');
    fireEvent.click(toggleBtn);
    
    // Al colapsar, el texto "Inicio" cambia a "I"
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.queryByText('Inicio')).not.toBeInTheDocument();
    
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });
});
