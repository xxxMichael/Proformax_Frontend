import api from "./axiosConfig";

export const getClientes = async (page = 1, limit = 20, search = "") => {
  try {
    const { data } = await api.get(`/clientes`, {
      params: { page, limit, search },
    });
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createCliente = async (clienteData) => {
  try {
    const { data } = await api.post(`/clientes`, clienteData);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCliente = async (id, clienteData) => {
  try {
    const { data } = await api.put(`/clientes/${id}`, clienteData);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteCliente = async (id) => {
  try {
    const { data } = await api.delete(`/clientes/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
