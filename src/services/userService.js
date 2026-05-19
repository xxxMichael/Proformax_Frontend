import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// GET /usuarios
export const getUsuarios = async (page = 1, limit = 20, rol = "", estado = "") => {
  try {
    const params = { page, limit };
    if (rol) params.rol = rol;
    if (estado !== "") params.estado = estado;

    const { data } = await axios.get(`${API_URL}/usuarios`, {
      headers: getHeaders(),
      params,
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar usuarios" };
  }
};

// POST /usuarios
export const createUsuario = async (usuario) => {
  try {
    const { data } = await axios.post(`${API_URL}/usuarios`, usuario, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error creando usuario" };
  }
};

// GET /usuarios/{id}
export const getUsuarioById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/usuarios/${id}`, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Usuario no encontrado" };
  }
};

// PUT /usuarios/{id}
export const updateUsuario = async (id, usuario) => {
  try {
    const { data } = await axios.put(`${API_URL}/usuarios/${id}`, usuario, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error actualizando usuario" };
  }
};

// PATCH /usuarios/{id}/estado
export const patchEstadoUsuario = async (id, estado) => {
  try {
    const { data } = await axios.patch(
      `${API_URL}/usuarios/${id}/estado`,
      { estado },
      { headers: getHeaders() }
    );
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error actualizando estado de usuario" };
  }
};
