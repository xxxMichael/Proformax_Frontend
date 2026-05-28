import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductModal from '../ProductModal';
import { validarDuplicadoProducto } from '../../services/productService';
import { getConfig } from '../../services/configService';

vi.mock('../../services/productService', () => ({
  validarDuplicadoProducto: vi.fn(),
}));

vi.mock('../../services/configService', () => ({
  getConfig: vi.fn(() => Promise.resolve({ data: { porcentajeIvaVigente: 15 } })),
}));

describe('ProductModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<ProductModal isOpen={false} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.queryByText('Nuevo Producto')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(<ProductModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText('Nuevo Producto')).toBeInTheDocument();
  });

  it('shows validation errors when saving empty form', async () => {
    render(<ProductModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);
    
    fireEvent.click(screen.getByText('Guardar Producto'));
    
    expect(await screen.findByText('Ingrese el código del producto')).toBeInTheDocument();
    expect(await screen.findByText('Ingrese el nombre del producto')).toBeInTheDocument();
    expect(await screen.findByText('Ingrese un precio válido')).toBeInTheDocument();
  });

  it('calls onSave when form is valid', async () => {
    validarDuplicadoProducto.mockResolvedValue([]);
    const mockOnSave = vi.fn();
    
    render(<ProductModal isOpen={true} onClose={vi.fn()} onSave={mockOnSave} />);
    
    fireEvent.change(document.querySelector('input[name="codigo"]'), { target: { value: 'PROD-1' } });
    fireEvent.change(document.querySelector('input[name="nombre"]'), { target: { value: 'Madera' } });
    fireEvent.change(document.querySelector('input[name="precioBase"]'), { target: { value: '10.50' } });
    fireEvent.change(document.querySelector('input[name="stockActual"]'), { target: { value: '100' } });
    
    fireEvent.click(screen.getByText('Guardar Producto'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('disables stock when type is servicio', async () => {
    render(<ProductModal isOpen={true} onClose={vi.fn()} onSave={vi.fn()} />);
    
    fireEvent.change(document.querySelector('select[name="tipo"]'), { target: { value: 'servicio' } });
    expect(document.querySelector('input[name="stockActual"]')).toBeDisabled();
  });
});
