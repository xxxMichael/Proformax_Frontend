import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Limpia los params para no enviar vacíos o undefined
const cleanParams = (params) => {
  const cleaned = {};
  for (const key in params) {
    if (params[key] !== "" && params[key] !== null && params[key] !== undefined) {
      cleaned[key] = params[key];
    }
  }
  return cleaned;
};

/* ============================================================
   GET /reportes/proformas
   ============================================================ */
export const getReporteProformas = async (filters = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/reportes/proformas`, {
      headers: getHeaders(),
      params: cleanParams(filters),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar reporte de proformas" };
  }
};

/* ============================================================
   GET /reportes/ventas-por-cliente
   ============================================================ */
export const getVentasPorCliente = async (filters = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/reportes/ventas-por-cliente`, {
      headers: getHeaders(),
      params: cleanParams(filters),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar reporte de ventas por cliente" };
  }
};

/* ============================================================
   GET /reportes/productos-mas-vendidos
   ============================================================ */
export const getProductosMasVendidos = async (filters = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/reportes/productos-mas-vendidos`, {
      headers: getHeaders(),
      params: cleanParams(filters),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar productos más vendidos" };
  }
};

/* ============================================================
   GET /reportes/inventario
   ============================================================ */
export const getReporteInventario = async (filters = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/reportes/inventario`, {
      headers: getHeaders(),
      params: cleanParams(filters),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar reporte de inventario" };
  }
};

/* ============================================================
   GET /reportes/rentabilidad
   ============================================================ */
export const getRentabilidad = async (filters = {}) => {
  try {
    const { data } = await axios.get(`${API_URL}/reportes/rentabilidad`, {
      headers: getHeaders(),
      params: cleanParams(filters),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al cargar rentabilidad" };
  }
};
