import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// 🔹 Adjunta token en cada request
const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/* ============================================================
   🟦 GET /proformas  →  Listar proformas con filtros
   ============================================================ */
export const getProformas = async (
  page = 1,
  limit = 20,
  search = "",
  estado = "",
  clienteId = "",
  usuarioId = ""
) => {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    if (estado) params.estado = estado;
    if (clienteId) params.clienteId = clienteId;
    if (usuarioId) params.usuarioId = usuarioId;

    const { data } = await axios.get(`${API_URL}/proformas`, {
      headers: getHeaders(),
      params,
    });

    return data; // { success, data: [...], total, totalPages }
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar proformas" };
  }
};

/* ============================================================
   🟩 POST /proformas → Crear proforma
   ============================================================ */
export const createProforma = async (proforma) => {
  try {
    const { data } = await axios.post(`${API_URL}/proformas`, proforma, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error creando proforma" };
  }
};

/* ============================================================
   🟦 GET /proformas/{id} → Obtener proforma con detalle completo
   ============================================================ */
export const getProformaById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/proformas/${id}`, {
      headers: getHeaders(),
    });

    return data; // { success, data: { ...proforma, cliente, usuario, detalles } }
  } catch (error) {
    throw error.response?.data || { message: "Proforma no encontrada" };
  }
};

/* ============================================================
   🟨 PUT /proformas/{id} → Actualizar proforma (solo EMITIDA)
   ============================================================ */
export const updateProforma = async (id, proforma) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/proformas/${id}`,
      proforma,
      { headers: getHeaders() }
    );

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error actualizando proforma" };
  }
};

/* ============================================================
   🔄 PATCH /proformas/{id}/estado → Cambiar estado
   EMITIDA → ACEPTADA | ANULADA
   ============================================================ */
export const cambiarEstadoProforma = async (id, estado, observaciones = "") => {
  try {
    const { data } = await axios.patch(
      `${API_URL}/proformas/${id}/estado`,
      { estado, observaciones },
      { headers: getHeaders() }
    );

    return data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Error cambiando estado de proforma" }
    );
  }
};

/* ============================================================
   📄 GET /proformas/{id}/pdf → Descargar PDF
   ============================================================ */
export const descargarProformaPdf = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/proformas/${id}/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      responseType: "blob",
    });

    // Crear enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `proforma-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error.response?.data || { message: "Error descargando PDF" };
  }
};
