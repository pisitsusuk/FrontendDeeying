// client/src/api/user.js
import axios from "axios";

const API = import.meta.env.VITE_API || "https://backenddeeying.onrender.com/api";

export const createUserCart = (token, cart) =>
  axios.post(`${API}/user/cart`, cart, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const listUserCart = (token) =>
  axios.get(`${API}/user/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// api/user.js
export const saveAddress = (token, payload) =>
  axios.post(`${API}/user/address`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });



export const saveOrder = (token, payload) =>
  axios.post(`${API}/user/order`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ✅ ใช้ path เดียวกับ backend
export const getOrders = (token) =>
  axios.get(`${API}/user/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

