import axios from "axios";

export const API_HOST =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// --- ใช้ต่อรูปสลิป ---
export const buildImageUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_HOST}${path.startsWith("/") ? path : `/${path}`}`;
};

// ===== Slips (ให้ตรงกับ slipAdmin.js) =====
// ใช้ /api/admin/approve ตามฝั่ง server (มี products มาด้วย)
export const Tableapproveslip = (token, status = "PENDING") =>
  axios.get(`${API_HOST}/api/admin/approve`, {
    params: { status },
    ...authHeader(token),
  });

export const updateSlipStatus = (token, slipId, action /* 'approve' | 'reject' */) =>
  axios.patch(`${API_HOST}/api/admin/slips/${slipId}`, { action }, authHeader(token));

export const deleteSlip = (token, slipId) =>
  axios.delete(`${API_HOST}/api/admin/slips/${slipId}`, authHeader(token));

// (ถ้าจะใช้ภายหลังคงไว้ได้ ไม่บังคับ)
// รายละเอียดสลิปแบบเดี่ยว
export const getSlipDetail = (token, slipId) =>
  axios.get(`${API_HOST}/api/admin/slips/${slipId}`, authHeader(token));

// ===== Users =====
export const getListAllUsers = (token) =>
  axios.get(`${API_HOST}/api/admin/users`, authHeader(token));

export const changeUserStatus = (token, { id, enabled }) =>
  axios.patch(`${API_HOST}/api/admin/users/${id}/enabled`, { enabled }, authHeader(token));

export const changeUserRole = (token, { id, role }) =>
  axios.patch(`${API_HOST}/api/admin/users/${id}/role`, { role }, authHeader(token));

// ===== Orders (สำหรับ TableOrders.jsx) =====
export const getOrderAdmin = (token) =>
  axios.get(`${API_HOST}/api/admin/orders`, authHeader(token));

// alias ให้ตัวสะกดที่อีกไฟล์ใช้ (มี s)
export const getOrdersAdmin = getOrderAdmin;

export const changeOrderStatus = (token, { cartId, order_status }) =>
  axios.put(
    `${API_HOST}/api/admin/order-status`,
    { cartId, order_status },
    authHeader(token)
  );
