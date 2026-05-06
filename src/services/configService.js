import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * 🟦 GET /config → Obtener configuración de empresa
 * Devuelve RUC, razón social, IVA vigente, etc.
 */
export const getConfig = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/config`, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al obtener la configuración" };
  }
};

/**
 * 🟨 PATCH /config → Actualizar configuración (parcial)
 * Solo ADMIN. PorcentajeIvaVigente debe ser entero (ej. 15).
 */
export const updateConfig = async (configData) => {
  try {
    const { data } = await axios.patch(`${API_URL}/config`, configData, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al actualizar la configuración" };
  }
};

/**
 * 🟨 PUT /config → Actualización total (alias de PATCH)
 */
export const putConfig = async (configData) => {
  try {
    const { data } = await axios.put(`${API_URL}/config`, configData, {
      headers: getHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error en actualización total" };
  }
};
