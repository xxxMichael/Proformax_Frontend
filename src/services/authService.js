import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; 

export const loginRequest = async (username, password) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });

    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error desconocido" };
  }
};

export const forgotPasswordRequest = async (email) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/forgot-password`, {
      email,
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al solicitar recuperación" };
  }
};

export const resetPasswordRequest = async (token, password) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      password,
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: "Error al restablecer contraseña" };
  }
};