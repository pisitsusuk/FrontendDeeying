import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";
const API = `${API_BASE.replace(/\/$/, "")}/api`;

// ---------- ต่อ URL รูปจาก path ให้เป็น URL เต็ม ----------
export const buildImageUrl = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const base = API_BASE.replace(/\/$/, "");
  return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
};

// ---------- ดึงรายการสลิป (แอดมิน) : ใช้ endpoint ที่มี products มาด้วย ----------
export const adminListSlips = (token, status) =>
  axios.get(`${API}/admin/approve`, {
    params: status ? { status } : {},
    headers: { Authorization: `Bearer ${token}` },
  });

// ---------- อัปเดตสถานะสลิป (แอดมิน) แบบส่ง status ตรง ----------
export const adminUpdateSlipStatus = async (token, id, status) => {
  const res = await axios.put(
    `${API}/admin/slips/${id}/status`,
    { status }, // 'PENDING' | 'APPROVED' | 'REJECTED'
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// ---------- (ตัวเลือกสำรอง) อัปเดตแบบ action ถ้าหลังบ้านใช้ approve/reject ----------
export const adminUpdateSlipStatusAlt = (token, id, status) => {
  const s = String(status).toUpperCase();
  const action = s === "APPROVED" ? "approve" : s === "REJECTED" ? "reject" : "pending";
  return axios.patch(
    `${API}/admin/slips/${id}`,
    { action },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// ---------- ลบสลิป ----------
export const adminDeleteSlip = (token, id) =>
  axios.delete(`${API}/admin/slips/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ---------- ประวัติออเดอร์ของผู้ใช้ ----------
export const getUserOrders = (token) =>
  axios.get(`${API}/user/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
