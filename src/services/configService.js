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
   🟦 GET /config → Obtener configuración de empresa
   ============================================================ */
export const getConfig = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/config`, {
      headers: getHeaders(),
    });

    return data; // { success, data: { id, ruc, razonSocial, ... } }
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar configuración" };
  }
};

/* ============================================================
   🟧 PATCH /config → Actualizar configuración parcial
   ============================================================ */
export const updateConfig = async (configData) => {
  try {
    const { data } = await axios.patch(`${API_URL}/config`, configData, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error actualizando configuración" };
  }
};

/* ============================================================
   🟨 PUT /config → Actualizar configuración completa
   ============================================================ */
export const updateConfigFull = async (configData) => {
  try {
    const { data } = await axios.put(`${API_URL}/config`, configData, {
      headers: getHeaders(),
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error actualizando configuración" };
  }
};
