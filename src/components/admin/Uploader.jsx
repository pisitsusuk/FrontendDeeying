// client/src/components/admin/Uploader.jsx
import React, { useId, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import useEcomStore from "../../store/ecom-store";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.heif,image/*";
const MAX = 5 * 1024 * 1024; // 5MB
const ALLOW_EXT = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
const ALLOW_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

// ----- API base -----
const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";
const API = `${API_BASE.replace(/\/$/, "")}/api`;

// helper: อ่าน token จาก store หรือ localStorage (กันช่วงรีไฮเดรต)
function useToken(fallback = true) {
  const t = useEcomStore((s) => s.token);
  if (t || !fallback) return t;
  try {
    const raw = localStorage.getItem("ecom-store");
    return raw ? JSON.parse(raw)?.state?.token : null;
  } catch {
    return null;
  }
}

// helper: file -> dataURL
const toDataURL = (file) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

// ปรับข้อมูลรูปให้เป็นโครงเดียว
const normalizeImg = (r) => ({
  asset_id: r?.asset_id ?? "",
  public_id: r?.public_id ?? "",
  url: r?.secure_url || r?.url || "",
  secure_url: r?.secure_url || r?.url || "",
  width: r?.width,
  height: r?.height,
  format: r?.format,
});

export default function Uploader({ form, setForm, token: tokenProp }) {
  const token = tokenProp || useToken();
  const inputId = useId();
  const [busy, setBusy] = useState(false);

  const addImages = (imgs) =>
    setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...imgs] }));

  const tryMultipartUpload = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axios.post(`${API}/images`, fd, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "multipart/form-data",
      },
    });
    // บางแบ็กเอนด์ส่ง {items:[...]} หรือส่งอ็อบเจ็กต์เดียว
    const items = Array.isArray(data?.items) ? data.items : [data];
    return items.map(normalizeImg);
  };

  const tryJsonUpload = async (file) => {
    const dataUrl = await toDataURL(file);
    const { data } = await axios.post(
      `${API}/images`,
      { image: dataUrl },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      }
    );
    const items = Array.isArray(data?.items) ? data.items : [data];
    return items.map(normalizeImg);
  };

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // reset ให้เลือกไฟล์เดิมซ้ำได้
    if (!files.length) return;

    try {
      setBusy(true);

      for (const f of files) {
        // ตรวจชนิด/นามสกุล/ขนาด
        const ext = (f.name || "").toLowerCase().split(".").pop();
        const okExt = ALLOW_EXT.includes(ext);
        const okMime = ALLOW_MIME.includes(f.type) || f.type === ""; // บางเครื่อง HEIC ไม่มี mime
        if (!okExt && !okMime) {
          toast.error(`ไฟล์ ${f.name} ไม่รองรับ`);
          continue;
        }
        if (f.size > MAX) {
          toast.error(`ไฟล์ ${f.name} เกิน 5MB`);
          continue;
        }

        // 1) ลอง multipart ก่อน
        let imgs = [];
        try {
          imgs = await tryMultipartUpload(f);
        } catch (err) {
          // 400 "missing image" หรือ 415 → fallback เป็น JSON dataURL
          imgs = await tryJsonUpload(f);
        }

        if (!imgs.length || !imgs[0]?.public_id) {
          toast.error(`อัปโหลด ${f.name} ไม่สำเร็จ`);
          continue;
        }
        addImages(imgs);
      }

      toast.success("อัปโหลดรูปสำเร็จ");
    } catch (err) {
      console.error("upload error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "อัปโหลดรูปไม่สำเร็จ";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (public_id) => {
    if (!public_id) return;
    try {
      setBusy(true);
      await axios.post(
        `${API}/removeimages`,
        { public_id },
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );
      setForm((prev) => ({
        ...prev,
        images: (prev.images || []).filter((im) => im.public_id !== public_id),
      }));
      toast.success("ลบรูปแล้ว");
    } catch (err) {
      console.error("remove error:", err);
      const msg =
        err?.response?.data?.message || err?.message || "ลบรูปไม่สำเร็จ";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const images = Array.isArray(form?.images) ? form.images : [];

  return (
    <div>
      {/* input ที่ซ่อน */}
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {/* ปุ่มเลือกไฟล์ */}
      <label
        htmlFor={inputId}
        className={`inline-flex cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 ${
          busy ? "pointer-events-none opacity-60" : ""
        }`}
      >
        เลือกไฟล์
      </label>

      {/* ปุ่มสำรอง (กันธีมบางตัว block label) */}
      <button
        type="button"
        onClick={() => document.getElementById(inputId)?.click()}
        disabled={busy}
        className="ml-2 rounded-lg border px-3 py-2 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-60"
      >
        เลือกไฟล์ (สำรอง)
      </button>

      <span className="ml-2 text-xs text-gray-500">
        รองรับ JPG / PNG / WEBP / HEIC (≤ 5MB)
      </span>

      {/* แสดงพรีวิวรูป */}
      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((im) => (
            <div
              key={im.public_id || im.url}
              className="relative overflow-hidden rounded-lg border"
            >
              <img
                src={im.secure_url || im.url}
                alt=""
                className="h-36 w-full object-cover"
                onError={(e) => (e.currentTarget.src = "/noimg.png")}
              />
              <button
                type="button"
                onClick={() => handleRemove(im.public_id)}
                title="ลบรูป"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                disabled={busy}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
