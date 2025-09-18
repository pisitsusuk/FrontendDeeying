import axios from 'axios'

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";
const API = `${API_BASE.replace(/\/$/, "")}/api`;

// ------- Create -------
export const createCategory = async (token, form) => {
  return axios.post(`${API}/category`, form, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ------- List -------
export const listCategory = async () => {
  return axios.get(`${API}/category`);
};

// ------- Remove -------
export const removeCategory = async (token, id) => {
  return axios.delete(`${API}/category/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ------- Update (✅ แก้แล้ว) -------
export const updateCategory = async (token, id, body) => {
  return axios.put(`${API}/category/${id}`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
