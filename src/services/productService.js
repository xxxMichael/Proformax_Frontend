import api from "./axiosConfig";

export const getProductos = async (page = 1, limit = 20, search = "", tipo = "") => {
  try {
    const { data } = await api.get(`/productos`, {
      params: { page, limit, search, tipo },
    });
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createProducto = async (productoData) => {
  try {
    const { data } = await api.post(`/productos`, productoData);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProducto = async (id, productoData) => {
  try {
    const { data } = await api.put(`/productos/${id}`, productoData);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteProducto = async (id) => {
  try {
    const { data } = await api.delete(`/productos/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
