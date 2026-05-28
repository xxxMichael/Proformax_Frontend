import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SupplierModal from '../SupplierModal';
import { validarDuplicadoProveedor } from '../../services/supplierService';

vi.mock('../../services/supplierService', () => ({
  validarDuplicadoProveedor: vi.fn(),
}));

describe('SupplierModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<SupplierModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByText('Nuevo Proveedor')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(<SupplierModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText('Nuevo Proveedor')).toBeInTheDocument();
  });

  it('shows validation errors when saving empty form', async () => {
    render(<SupplierModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);
    
    fireEvent.click(screen.getByText('Guardar Proveedor'));
    
    expect(await screen.findByText('RUC inválido (13 dígitos, termina en 001)')).toBeInTheDocument();
    expect(await screen.findByText('Ingrese la razón social')).toBeInTheDocument();
  });

  it('calls onSave when form is valid', async () => {
    validarDuplicadoProveedor.mockResolvedValue([]);
    const mockOnSave = vi.fn();
    
    render(<SupplierModal isOpen={true} onClose={vi.fn()} onSave={mockOnSave} />);
    
    // RUC Válido simulado (Estructura de Persona Natural + 001)
    fireEvent.change(document.querySelector('input[name="identificacion"]'), { target: { value: '1712345675001' } });
    fireEvent.change(document.querySelector('input[name="razonSocial"]'), { target: { value: 'Proveedor SA' } });
    fireEvent.change(document.querySelector('input[name="telefono"]'), { target: { value: '0999999999' } });
    fireEvent.change(document.querySelector('input[name="email"]'), { target: { value: 'proveedor@test.com' } });
    fireEvent.change(document.querySelector('input[name="direccion"]'), { target: { value: 'Quito' } });
    
    fireEvent.click(screen.getByText('Guardar Proveedor'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });
});
