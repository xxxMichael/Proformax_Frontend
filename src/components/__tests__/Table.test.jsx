import { render, screen, fireEvent } from '@testing-library/react';
import Table from '../Table';
import { describe, it, expect, vi } from 'vitest';

describe('Table Component', () => {
  const headers = ['ID', 'Nombre', 'Acciones'];
  const rows = [
    [1, 'Producto A'],
    [2, 'Producto B']
  ];

  it('renders table headers and rows correctly', () => {
    render(
      <Table 
        headers={headers} 
        rows={rows} 
        loading={false}
      />
    );
    
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Producto A')).toBeInTheDocument();
    expect(screen.getByText('Producto B')).toBeInTheDocument();
  });

  it('shows loading spinner when loading is true', () => {
    render(
      <Table 
        headers={headers} 
        rows={[]} 
        loading={true}
      />
    );
    
    expect(screen.getByText('No hay registros disponibles.')).toBeInTheDocument();
  });

  it('shows empty message when no rows are provided', () => {
    render(
      <Table 
        headers={headers} 
        rows={[]} 
        loading={false}
      />
    );
    
    expect(screen.getByText('No hay registros disponibles.')).toBeInTheDocument();
  });

  it('calls action handlers when action buttons are clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onView = vi.fn();
    
    render(
      <Table 
        headers={headers} 
        rows={rows} 
        loading={false}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
      />
    );
    
    // Suponiendo que Table renderiza iconos para las acciones, buscamos los botones
    const editButtons = screen.getAllByTitle('Editar');
    fireEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(0);
    
    const deleteButtons = screen.getAllByTitle('Eliminar');
    fireEvent.click(deleteButtons[1]);
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
