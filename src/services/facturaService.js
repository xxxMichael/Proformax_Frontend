import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/* ============================================================
   GET /facturas → Listar facturas de compra
   ============================================================ */
export const getFacturas = async (page = 1, limit = 20, proveedorId = "") => {
  try {
    const params = { page, limit };
    if (proveedorId) params.proveedorId = proveedorId;

    const { data } = await axios.get(`${API_URL}/facturas`, {
      headers: getHeaders(),
      params,
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar facturas" };
  }
};

/* ============================================================
   GET /facturas/{id} → Obtener factura por ID con detalles
   ============================================================ */
export const getFacturaById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/facturas/${id}`, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Factura no encontrada" };
  }
};

/* ============================================================
   POST /facturas/analizar → [Paso 1] Analizar con Azure AI
   ============================================================ */
export const analizarFactura = async (file) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("factura", file);

    const { data } = await axios.post(`${API_URL}/facturas/analizar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al analizar factura" };
  }
};

/* ============================================================
   POST /facturas/confirmar → [Paso 2] Confirmar y guardar
   ============================================================ */
export const confirmarFactura = async (payload) => {
  try {
    const { data } = await axios.post(`${API_URL}/facturas/confirmar`, payload, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al confirmar factura" };
  }
};
