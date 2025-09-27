import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "https://backenddeeying.onrender.com/api",
  withCredentials: true,
});

// ให้ดึงข้อความจาก server ง่าย ๆ
api.interceptors.response.use(
  (r) => r,
  (err) => {
    err.userMessage = err?.response?.data?.message || err.message || "Server error";
    return Promise.reject(err);
  }
);

export default api;
