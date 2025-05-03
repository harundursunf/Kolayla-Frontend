// src/services/authService.js
import axios from "axios";

const API_URL = "https://localhost:5001/api/auth"; 


export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};
