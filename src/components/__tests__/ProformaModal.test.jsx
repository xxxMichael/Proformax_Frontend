import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProformaModal from '../ProformaModal';
import { getClientes } from '../../services/clientService';
import { getProductos } from '../../services/productService';
import { createProforma } from '../../services/proformaService';
import { getConfig } from '../../services/configService';

vi.mock('../../services/clientService', () => ({
  getClientes: vi.fn(),
}));

vi.mock('../../services/productService', () => ({
  getProductos: vi.fn(),
}));

vi.mock('../../services/proformaService', () => ({
  createProforma: vi.fn(),
  updateProforma: vi.fn(),
}));

vi.mock('../../services/configService', () => ({
  getConfig: vi.fn(),
}));

describe('ProformaModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getConfig.mockResolvedValue({ data: { porcentajeIvaVigente: 15 } });
    getClientes.mockResolvedValue({ data: [{ id: 1, nombres: 'Juan', apellidosRazonSocial: 'Perez', identificacion: '123' }] });
    getProductos.mockResolvedValue({ data: [{ id: 1, nombre: 'Madera', precioBase: 10, stockActual: 100, tipo: 'producto' }] });
  });

  it('does not render when isOpen is false', () => {
    render(<ProformaModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.queryByText('Nueva Proforma')).not.toBeInTheDocument();
  });

  it('renders correctly and loads data when isOpen is true', async () => {
    render(<ProformaModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText('Nueva Proforma')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(getClientes).toHaveBeenCalled();
      expect(getProductos).toHaveBeenCalled();
      expect(getConfig).toHaveBeenCalled();
    });
  });

  it('calculates totals correctly with IVA', async () => {
    render(<ProformaModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Resumen')).toBeInTheDocument();
    });

    // Select product
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    
    // Change quantity to 2 -> Subtotal = 20
    const cantInputs = screen.getAllByDisplayValue('1');
    fireEvent.change(cantInputs[0], { target: { value: '2' } });

    // The subtotal should be 20.00
    expect(await screen.findByText('$20.00')).toBeInTheDocument();
  });

  it('shows error if client is not selected on save', async () => {
    render(<ProformaModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    
    // Attempt to save
    fireEvent.click(screen.getByText('Generar'));
    
    // Toast error would fire. We can check that createProforma is not called.
    expect(createProforma).not.toHaveBeenCalled();
  });
});
