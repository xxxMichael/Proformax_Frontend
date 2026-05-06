import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getProveedores = async (page = 1, limit = 20, search = "") => {
  try {
    const { data } = await axios.get(`${API_URL}/proveedores`, {
      headers: getHeaders(),
      params: { page, limit, search },
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar proveedores" };
  }
};

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

export const updateProveedor = async (id, proveedor) => {
  try {
    const { data } = await axios.put(`${API_URL}/proveedores/${id}`, proveedor, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error actualizando proveedor" };
  }
};

export const deleteProveedor = async (id) => {
  try {
    const { data } = await axios.delete(`${API_URL}/proveedores/${id}`, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error eliminando proveedor" };
  }
};
