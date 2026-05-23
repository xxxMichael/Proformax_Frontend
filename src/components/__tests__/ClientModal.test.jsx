import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientModal from '../ClientModal';
import { validarDuplicadoCliente } from '../../services/clientService';

vi.mock('../../services/clientService', () => ({
  validarDuplicadoCliente: vi.fn(),
}));

describe('ClientModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<ClientModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByText('Nuevo Cliente')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(<ClientModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText('Nuevo Cliente')).toBeInTheDocument();
    expect(document.querySelector('input[name="names"]')).toBeInTheDocument();
  });

  it('shows validation errors when saving empty form', async () => {
    render(<ClientModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);
    
    fireEvent.click(screen.getByText('Guardar Cliente'));
    
    expect(await screen.findByText('Ingrese nombres')).toBeInTheDocument();
    expect(await screen.findByText('Ingrese apellidos')).toBeInTheDocument();
  });

  it('calls onSave when form is valid', async () => {
    validarDuplicadoCliente.mockResolvedValue([]);
    const mockOnSave = vi.fn();
    
    render(<ClientModal isOpen={true} onClose={vi.fn()} onSave={mockOnSave} />);
    
    fireEvent.change(document.querySelector('input[name="names"]'), { target: { value: 'Juan' } });
    fireEvent.change(document.querySelector('input[name="lastnames"]'), { target: { value: 'Perez' } });
    fireEvent.change(document.querySelector('input[name="idNumber"]'), { target: { value: '1710034065' } });
    fireEvent.change(document.querySelector('input[name="phone"]'), { target: { value: '0999999999' } });
    fireEvent.change(document.querySelector('input[name="email"]'), { target: { value: 'test@test.com' } });
    
    fireEvent.click(screen.getByText('Guardar Cliente'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });
});
