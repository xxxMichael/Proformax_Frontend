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
   🟦 GET /clientes  →  Listar clientes con búsqueda + paginación
   ============================================================ */
export const getClientes = async (page = 1, limit = 20, search = "") => {
  try {
    const { data } = await axios.get(`${API_URL}/clientes`, {
      headers: getHeaders(),
      params: { page, limit, search },
    });

    return data; // devuelve { total, page, limit, totalPages, data: [...] }
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar clientes" };
  }
};

/* ============================================================
   🟩 POST /clientes → Crear cliente
   ============================================================ */
export const createCliente = async (cliente) => {
  try {
    const { data } = await axios.post(`${API_URL}/clientes`, cliente, {
      headers: getHeaders(),
    });

    return data; // devuelve success:true y data:{...}
  } catch (error) {
    throw error.response?.data || { message: "Error creando cliente" };
  }
};

/* ============================================================
   🟦 GET /clientes/{id} → Obtener un cliente por ID
   ============================================================ */
export const getClienteById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/clientes/${id}`, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Cliente no encontrado" };
  }
};

/* ============================================================
   🟨 PUT /clientes/{id} → Actualización COMPLETA
   ============================================================ */
export const updateCliente = async (id, cliente) => {
  try {
    const { data } = await axios.put(`${API_URL}/clientes/${id}`, cliente, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error actualizando cliente" };
  }
};

/* ============================================================
   🟧 PATCH /clientes/{id} → Actualización PARCIAL
   ============================================================ */
export const patchCliente = async (id, clienteParcial) => {
  try {
    const { data } = await axios.patch(
      `${API_URL}/clientes/${id}`,
      clienteParcial,
      { headers: getHeaders() }
    );

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error en actualización parcial" };
  }
};

/* ============================================================
   🟥 DELETE /clientes/{id} → Eliminar cliente
   ============================================================ */
export const deleteCliente = async (id) => {
  try {
    const { data } = await axios.delete(`${API_URL}/clientes/${id}`, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error eliminando cliente" };
  }
};
// 🔍 Validar si existe cliente por identificación o email
export const validarDuplicadoCliente = async (identificacion, email) => {
  try {
    const { data } = await axios.get(`${API_URL}/clientes`, {
      headers: getHeaders(),
      params: {
        search: identificacion || email,
        limit: 1
      }
    });

    return data.data; // lista de coincidencias
  } catch (error) {
    throw error.response?.data || { message: "Error validando cliente" };
  }
};