import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FacturaModal from '../FacturaModal';
import { analizarFactura, confirmarFactura } from '../../services/facturaService';
import { getProductos } from '../../services/productService';

vi.mock('../../services/facturaService', () => ({
  analizarFactura: vi.fn(),
  confirmarFactura: vi.fn(),
}));

vi.mock('../../services/productService', () => ({
  getProductos: vi.fn(),
}));

describe('FacturaModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getProductos.mockResolvedValue({ data: [{ id: 1, nombre: 'Producto 1', codigo: 'P01' }] });
  });

  it('does not render when isOpen is false', () => {
    render(<FacturaModal isOpen={false} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.queryByText('Nueva Factura de Compra')).not.toBeInTheDocument();
  });

  it('renders correctly and starts at step 1', () => {
    render(<FacturaModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByText('Nueva Factura de Compra')).toBeInTheDocument();
    expect(screen.getByText('Arrastre su factura o haga clic para seleccionar')).toBeInTheDocument();
  });

  it('handles analysis and advances to step 2', async () => {
    analizarFactura.mockResolvedValue({
      datosExtraidos: { numeroFactura: '001-001-123456789', fechaEmision: '2023-11-20', total: 100, items: [] },
      candidatosProveedor: [{ id: 1, razonSocial: 'Proveedor Test', identificacion: '1791234567001', _score: 100 }],
      avisos: []
    });

    render(<FacturaModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    // Mocking file upload via input
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);

    expect(screen.getByText('test.pdf')).toBeInTheDocument();

    // Click Analyze
    fireEvent.click(screen.getByText(/Analizar Factura/i));

    await waitFor(() => {
      expect(analizarFactura).toHaveBeenCalledWith(file);
      // Advances to step 2
      expect(screen.getByText('Revisar y Confirmar')).toBeInTheDocument();
    });
  });
});
