// client/src/components/admin/Uploader.jsx
import React, { useId, useState } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { uploadFiles, removeFiles } from "../../api/product";
import useEcomStore from "../../store/ecom-store";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.heic,.heif,image/*";
const MAX = 5 * 1024 * 1024; // 5MB
const ALLOW_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export default function Uploader({ form, setForm }) {
  const [uploading, setUploading] = useState(false);
  const inputId = useId();

  // ดึง token สดจาก store + มี fallback จาก localStorage กันช่วง rehydrate
  const storeToken = useEcomStore((s) => s.token);
  const token =
    storeToken ??
    (() => {
      try {
        const raw = localStorage.getItem("ecom-store");
        return raw ? JSON.parse(raw)?.state?.token : null;
      } catch {
        return null;
      }
    })();

  const asDataURL = (file) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);

      for (const f of files) {
        // ตรวจชนิด/ขนาดไฟล์
        const okType = ALLOW_MIME.includes(f.type) || f.type === ""; // HEIC บางเครื่อง type จะว่าง
        const ext = (f.name || "").toLowerCase().split(".").pop();
        const okExt = ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext);
        if (!okType && !okExt) { toast.error(`ไฟล์ ${f.name} ไม่รองรับ`); continue; }
        if (f.size > MAX)      { toast.error(`ไฟล์ ${f.name} เกิน 5MB`); continue; }

        // อัปโหลด (ตัว axios interceptor จะเติม Authorization ให้อัตโนมัติอยู่แล้ว)
        const dataUrl = await asDataURL(f);
        const res = await uploadFiles(token, dataUrl);
        const img = res?.data;

        if (!img?.public_id) { toast.error(`อัปโหลด ${f.name} ไม่สำเร็จ`); continue; }

        setForm((prev) => ({
          ...prev,
          images: [
            ...(prev?.images || []),
            {
              asset_id: img.asset_id ?? "",
              public_id: img.public_id ?? "",
              url: img.url ?? "",
              secure_url: img.secure_url ?? "",
            },
          ],
        }));
      }

      toast.success("อัปโหลดรูปสำเร็จ");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.status === 401
          ? "สิทธิ์ไม่พอ/เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง"
          : (err?._friendly || "อัปโหลดรูปไม่สำเร็จ");
      toast.error(msg);
    } finally {
      setUploading(false);
      e.target.value = ""; // ให้เลือกไฟล์เดิมซ้ำได้
    }
  };

  const handleRemove = async (public_id) => {
    if (!public_id) return;
    try {
      setUploading(true);
      await removeFiles(token, public_id); // interceptor จะเติม header ให้
      setForm((prev) => ({
        ...prev,
        images: (prev?.images || []).filter((im) => im.public_id !== public_id),
      }));
      toast.success("ลบรูปแล้ว");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.status === 401
          ? "สิทธิ์ไม่พอ/เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง"
          : (err?._friendly || "ลบรูปไม่สำเร็จ");
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* input แบบซ่อน */}
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {/* ปุ่มหลัก (label ชี้ไปที่ input) */}
      <label
        htmlFor={inputId}
        className={`inline-flex cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 ${uploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        เลือกไฟล์
      </label>

      {/* ปุ่มสำรอง เผื่อธีม/ปลั๊กอินไปกระทบ label */}
      <button
        type="button"
        onClick={() => document.getElementById(inputId)?.click()}
        disabled={uploading}
        className="ml-2 rounded-lg border px-3 py-2 text-sm shadow-sm hover:bg-gray-50 disabled:opacity-60"
      >
        เลือกไฟล์ (สำรอง)
      </button>

      <span className="ml-2 text-xs text-gray-500">
        รองรับ JPG / PNG / WEBP / HEIC (≤ 5MB)
      </span>

      {/* แกลเลอรีพรีวิว */}
      {Array.isArray(form?.images) && form.images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {form.images.map((im) => (
            <div key={im.public_id || im.url} className="relative overflow-hidden rounded-lg border">
              <img src={im.secure_url || im.url} alt="" className="h-36 w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(im.public_id)}
                title="ลบรูป"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                disabled={uploading}
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
