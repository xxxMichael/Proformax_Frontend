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
   🟦 GET /productos  →  Listar productos con búsqueda + paginación
   ============================================================ */
export const getProductos = async (page = 1, limit = 20, search = "", tipo = "") => {
  try {
    const params = { page, limit, search };
    if (tipo) params.tipo = tipo;

    const { data } = await axios.get(`${API_URL}/productos`, {
      headers: getHeaders(),
      params,
    });

    return data; // { total, page, limit, totalPages, data: [...] }
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar productos" };
  }
};

/* ============================================================
   🟩 POST /productos → Crear producto
   ============================================================ */
export const createProducto = async (producto) => {
  try {
    const { data } = await axios.post(`${API_URL}/productos`, producto, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error creando producto" };
  }
};

/* ============================================================
   🟦 GET /productos/{id} → Obtener un producto por ID
   ============================================================ */
export const getProductoById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/productos/${id}`, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Producto no encontrado" };
  }
};

/* ============================================================
   🟨 PUT /productos/{id} → Actualización COMPLETA
   ============================================================ */
export const updateProducto = async (id, producto) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/productos/${id}`,
      producto,
      { headers: getHeaders() }
    );

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error actualizando producto" };
  }
};

/* ============================================================
   🟧 PATCH /productos/{id} → Actualización PARCIAL
   ============================================================ */
export const patchProducto = async (id, productoParcial) => {
  try {
    const { data } = await axios.patch(
      `${API_URL}/productos/${id}`,
      productoParcial,
      { headers: getHeaders() }
    );

    return data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Error en actualización parcial" }
    );
  }
};

/* ============================================================
   🟥 DELETE /productos/{id} → Desactivar producto (baja lógica)
   ============================================================ */
export const deleteProducto = async (id) => {
  try {
    const { data } = await axios.delete(`${API_URL}/productos/${id}`, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Error desactivando producto" }
    );
  }
};

/* ============================================================
   🔍 Validar duplicados por código
   ============================================================ */
export const validarDuplicadoProducto = async (codigo) => {
  try {
    const { data } = await axios.get(`${API_URL}/productos`, {
      headers: getHeaders(),
      params: { search: codigo, limit: 5 },
    });

    return data.data;
  } catch (error) {
    throw error.response?.data || { message: "Error validando producto" };
  }
};
