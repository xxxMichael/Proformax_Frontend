import "./Table.css";

export default function Table({
  headers,
  rows,
  onView,
  onEdit,
  onDelete,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
}) {

  // CÁLCULO DE PÁGINAS
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = rows.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <table className="custom-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {paginatedRows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((col, colIndex) => (
                <td key={colIndex}>{col}</td>
              ))}

              {/* ACCIONES */}
              <td className="acciones">
                {onView && (
                  <button
                    className="accion-btn view-btn"
                    onClick={() => onView(startIndex + rowIndex)}
                  >
                    👁
                  </button>
                )}

                {onEdit && (
                  <button
                    className="accion-btn edit-btn"
                    onClick={() => onEdit(startIndex + rowIndex)}
                  >
                    ✏
                  </button>
                )}

                {onDelete && (
                  <button
                    className="accion-btn delete-btn"
                    onClick={() => onDelete(startIndex + rowIndex)}
                  >
                    🗑
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINACIÓN */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ← Anterior
        </button>

        <span className="page-info">
          Página {currentPage} de {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}