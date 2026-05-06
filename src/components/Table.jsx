import { Eye, Edit, Trash2, RefreshCcw } from "lucide-react";
import "./Table.css";

export default function Table({
  headers,
  rows,
  onView,
  onEdit,
  onDelete,
  onCustomAction,
  customActionIcon = null,
  customActionTitle = "Acción",
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
}) {
  // CÁLCULO DE PÁGINAS
  const totalPages = Math.ceil(rows.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = rows.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="table-wrapper">
      <table className="custom-table-new">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {paginatedRows.length > 0 ? (
            paginatedRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((col, colIndex) => (
                  <td key={colIndex}>{col}</td>
                ))}

                <td className="acciones-new">
                  {onView && (
                    <button
                      className="btn-icon-action-premium view"
                      onClick={() => onView(startIndex + rowIndex)}
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                  )}

                  {onEdit && (
                    <button
                      className="btn-icon-action-premium edit"
                      onClick={() => onEdit(startIndex + rowIndex)}
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                  )}

                  {onCustomAction && (
                    <button
                      className="btn-icon-action-premium custom"
                      onClick={() => onCustomAction(startIndex + rowIndex)}
                      title={customActionTitle}
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", fontSize: "12px", fontWeight: 600 }}
                    >
                      {customActionIcon || <RefreshCcw size={14} />}
                      <span>Estado</span>
                    </button>
                  )}

                  {onDelete && (
                    <button
                      className="btn-icon-action-premium delete"
                      onClick={() => onDelete(startIndex + rowIndex)}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="no-data">
                No hay registros disponibles.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINACIÓN */}
      <div className="table-pagination-new">
        <button
          className="page-nav-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ← Anterior
        </button>

        <span className="page-count-text">
          Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
        </span>

        <button
          className="page-nav-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}