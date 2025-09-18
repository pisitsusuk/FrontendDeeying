import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";
const API = `${API_BASE.replace(/\/$/, "")}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  try {
    const raw = localStorage.getItem("ecom-store");
    const token = raw ? JSON.parse(raw)?.state?.token : null;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return cfg;
});

const rethrow = (err, path, fallback = "Request error") => {
  const status = err?.response?.status;
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback;
  const detail = `[${status ?? "ERR"}] ${API}${path} -> ${msg}`;
  err._friendly = detail;
  throw err;
};

// ===== Products =====
export const createProduct = async (token, form) => {
  const path = `/product`;
  try {
    return await api.post(path, form, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (err) {
    rethrow(err, path, "สร้างสินค้าไม่สำเร็จ");
  }
};

export const listProduct = async (count = 20) => {
  const path = `/products/${count}`;
  try {
    return await api.get(path);
  } catch (err) {
    rethrow(err, path, "ดึงรายการสินค้าไม่สำเร็จ");
  }
};

export const readProduct = async (token, id) => {
  const path = `/product/${id}`;
  try {
    return await api.get(path, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (err) {
    rethrow(err, path, "ดึงข้อมูลสินค้าไม่สำเร็จ");
  }
};

export const deleteProduct = async (token, id) => {
  const path = `/product/${id}`;
  try {
    return await api.delete(path, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (err) {
    rethrow(err, path, "ลบสินค้าไม่สำเร็จ");
  }
};

export const updateProduct = async (token, id, form) => {
  const path = `/product/${id}`;
  try {
    return await api.put(path, form, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (err) {
    rethrow(err, path, "อัปเดตสินค้าไม่สำเร็จ");
  }
};

// ===== Images (ทางเดียว) =====
export const uploadFiles = async (file) => {
  const path = `/images`;
  try {
    if (!(file instanceof Blob)) {
      throw new Error("uploadFiles: ต้องเป็นไฟล์จริง (File/Blob)");
    }

    // เตรียม token จาก localStorage (interceptor ของ axios จะไม่ถูกใช้ใน fetch)
    let token = null;
    try {
      const raw = localStorage.getItem("ecom-store");
      token = raw ? JSON.parse(raw)?.state?.token : null;
    } catch {}

    const fd = new FormData();
    fd.append("image", file, file.name || "upload.bin");

    // ใช้ fetch ตรง ๆ หลีกเลี่ยง header ถูกทับ
    const resp = await fetch(`${API}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd, // ห้ามตั้ง Content-Type เอง ปล่อย browser ใส่ boundary
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const msg = data?.message || data?.error || "อัปโหลดรูปไม่สำเร็จ";
      const err = new Error(msg);
      err.response = { status: resp.status, data };
      throw err;
    }
    return { data };
  } catch (err) {
    // ให้รูปแบบ error เดิม
    const status = err?.response?.status;
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "อัปโหลดรูปไม่สำเร็จ";
    const detail = `[${status ?? "ERR"}] ${API}/images -> ${msg}`;
    err._friendly = detail;
    throw err;
  }
};



export const removeFiles = async (public_id) => {
  const path = `/removeimages`;
  try {
    return await api.post(path, { public_id });
  } catch (err) {
    rethrow(err, path, "ลบรูปไม่สำเร็จ");
  }
};

// ===== Search / ListBy =====
export const searchFilters = async (arg) => {
  const path = `/search/filters`;
  try {
    return await api.post(path, arg);
  } catch (err) {
    rethrow(err, path, "ค้นหาไม่สำเร็จ");
  }
};

export const listProductBy = async (sort, order, limit) => {
  const path = `/productby`;
  try {
    return await api.post(path, { sort, order, limit });
  } catch (err) {
    rethrow(err, path, "ดึงสินค้าจัดเรียงไม่สำเร็จ");
  }
};
