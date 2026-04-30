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
   🟦 GET /proveedores  →  Listar proveedores con búsqueda + paginación
   ============================================================ */
export const getProveedores = async (page = 1, limit = 20, search = "") => {
  try {
    const { data } = await axios.get(`${API_URL}/proveedores`, {
      headers: getHeaders(),
      params: { page, limit, search },
    });

    return data; // { total, page, limit, totalPages, data: [...] }
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar proveedores" };
  }
};

/* ============================================================
   🟩 POST /proveedores → Crear proveedor
   ============================================================ */
export const createProveedor = async (proveedor) => {
  try {
    const { data } = await axios.post(`${API_URL}/proveedores`, proveedor, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error creando proveedor" };
  }
};

/* ============================================================
   🟦 GET /proveedores/{id} → Obtener un proveedor por ID
   ============================================================ */
export const getProveedorById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/proveedores/${id}`, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Proveedor no encontrado" };
  }
};

/* ============================================================
   🟨 PUT /proveedores/{id} → Actualización COMPLETA
   ============================================================ */
export const updateProveedor = async (id, proveedor) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/proveedores/${id}`,
      proveedor,
      { headers: getHeaders() }
    );

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error actualizando proveedor" };
  }
};

/* ============================================================
   🟧 PATCH /proveedores/{id} → Actualización PARCIAL
   ============================================================ */
export const patchProveedor = async (id, proveedorParcial) => {
  try {
    const { data } = await axios.patch(
      `${API_URL}/proveedores/${id}`,
      proveedorParcial,
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
   🟥 DELETE /proveedores/{id} → Desactivar proveedor (baja lógica)
   ============================================================ */
export const deleteProveedor = async (id) => {
  try {
    const { data } = await axios.delete(`${API_URL}/proveedores/${id}`, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Error desactivando proveedor" }
    );
  }
};

/* ============================================================
   🔍 Validar duplicados por identificación o email
   ============================================================ */
export const validarDuplicadoProveedor = async (identificacion, email) => {
  try {
    const headers = getHeaders();

    const [resByIdentificacion, resByEmail] = await Promise.all([
      axios.get(`${API_URL}/proveedores`, {
        headers,
        params: { search: identificacion, limit: 5 },
      }),
      axios.get(`${API_URL}/proveedores`, {
        headers,
        params: { search: email, limit: 5 },
      }),
    ]);

    const coincidencias = [
      ...resByIdentificacion.data.data,
      ...resByEmail.data.data,
    ];

    // Eliminar duplicados por id
    const unicos = coincidencias.filter(
      (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
    );

    return unicos;
  } catch (error) {
    throw error.response?.data || { message: "Error validando proveedor" };
  }
};
