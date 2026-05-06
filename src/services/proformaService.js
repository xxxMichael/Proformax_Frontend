import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getProformas = async (page = 1, limit = 20, search = "", estado = "") => {
  try {
    const { data } = await axios.get(`${API_URL}/proformas`, {
      headers: getHeaders(),
      params: { page, limit, search, estado },
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar proformas" };
  }
};

export const getProformaById = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/proformas/${id}`, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Proforma no encontrada" };
  }
};

export const createProforma = async (proformaData) => {
  try {
    const { data } = await axios.post(`${API_URL}/proformas`, proformaData, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al crear proforma" };
  }
};

export const updateProforma = async (id, proformaData) => {
  try {
    const { data } = await axios.put(`${API_URL}/proformas/${id}`, proformaData, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al actualizar proforma" };
  }
};

export const updateProformaStatus = async (id, nuevoEstado, observaciones) => {
  try {
    const { data } = await axios.patch(
      `${API_URL}/proformas/${id}/estado`,
      { estado: nuevoEstado, observaciones },
      { headers: getHeaders() }
    );
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al cambiar estado" };
  }
};
