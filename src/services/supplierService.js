import api from "./axiosConfig";

export const getProveedores = async (page = 1, limit = 20, search = "") => {
  try {
    const { data } = await api.get(`/proveedores`, {
      params: { page, limit, search },
    });
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createProveedor = async (proveedorData) => {
  try {
    const { data } = await api.post(`/proveedores`, proveedorData);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProveedor = async (id, proveedorData) => {
  try {
    const { data } = await api.put(`/proveedores/${id}`, proveedorData);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteProveedor = async (id) => {
  try {
    const { data } = await api.delete(`/proveedores/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
