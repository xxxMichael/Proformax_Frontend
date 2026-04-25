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