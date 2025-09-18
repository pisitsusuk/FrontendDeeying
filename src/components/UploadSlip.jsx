// client/src/components/UploadSlip.jsx
import React, { useMemo, useState } from "react";
import { uploadFiles } from "../api/product";
import useEcomStore from "../store/ecom-store";

const ACCEPTS_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const ACCEPTS_EXT = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
const ACCEPTS_STRING = [...ACCEPTS_MIME, ...ACCEPTS_EXT].join(",");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function UploadSlip({ value, onChange }) {
  const storeToken = useEcomStore((s) => s.token);
  const hasToken = !!storeToken || !!getTokenFromLocalStorage();

  const [preview, setPreview] = useState(value?.secure_url || value?.url || "");
  const [loading, setLoading] = useState(false);

  const hint = useMemo(
    () => "JPG / PNG / WebP / HEIC / HEIF (≤ 5MB)",
    []
  );

  function getTokenFromLocalStorage() {
    try {
      const raw = localStorage.getItem("ecom-store");
      return raw ? JSON.parse(raw)?.state?.token : null;
    } catch {
      return null;
    }
  }

  const isAcceptable = (file) => {
    if (!(file instanceof File)) return false;
    if (file.type && ACCEPTS_MIME.includes(file.type)) return true;
    const name = (file.name || "").toLowerCase();
    return ACCEPTS_EXT.some((ext) => name.endsWith(ext));
  };

  const validate = (file) => {
    if (!isAcceptable(file)) throw new Error("ไฟล์ไม่รองรับ");
    if (file.size > MAX_SIZE) throw new Error("ไฟล์ใหญ่เกิน 5MB");
  };

  const processFile = async (file) => {
    try {
      if (!(file instanceof Blob)) throw new Error("ไฟล์ไม่ถูกต้อง (ต้องเป็นรูปภาพ)");
      validate(file);
      setLoading(true);

      const res = await uploadFiles(file); // ← ส่งไฟล์จริง (FormData)
      const img = {
        asset_id: res.data.asset_id,
        public_id: res.data.public_id,
        url: res.data.url,
        secure_url: res.data.secure_url,
      };

      setPreview(img.secure_url || img.url);
      onChange?.(img);
    } catch (e) {
      alert(e?._friendly || e?.message || "อัปโหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const takeFirstAcceptableFile = (list) => {
    if (!list) return null;
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      if (f instanceof File && isAcceptable(f)) return f;
    }
    return null;
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (!hasToken || loading) return;

    // รองรับทั้ง files และ items (บางบราวเซอร์ให้ไฟล์ผ่าน items)
    const fileFromFiles = takeFirstAcceptableFile(e.dataTransfer?.files);
    if (fileFromFiles) return processFile(fileFromFiles);

    const items = e.dataTransfer?.items;
    if (items && items.length) {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file") {
          const f = it.getAsFile();
          if (f && isAcceptable(f)) return processFile(f);
        }
      }
    }
  };

  const onPick = (e) => {
    const file = takeFirstAcceptableFile(e.target?.files);
    if (file) processFile(file);
    // reset เพื่อให้เลือกไฟล์เดิมซ้ำได้
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="relative grid place-items-center rounded-xl border-2 border-dashed p-6 text-center transition bg-white"
      >
        <input
          type="file"
          accept={ACCEPTS_STRING}
          disabled={!hasToken || loading}
          onChange={onPick}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />

        {preview ? (
          <div className="pointer-events-none w-full max-w-md">
            <img
              src={preview}
              alt="slip preview"
              className="mx-auto w-full rounded-lg object-contain"
            />
          </div>
        ) : (
          <div className="pointer-events-none">
            <svg className="mx-auto mb-2 h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none">
              <path d="M12 16v-8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="font-medium">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์</p>
            <p className="text-xs text-slate-500 mt-1">{hint}</p>
          </div>
        )}

        {loading && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl bg-white/60 text-sm">
            กำลังอัปโหลด...
          </div>
        )}
      </div>

      {!hasToken && (
        <p className="text-xs text-amber-600">จำเป็นต้องเข้าสู่ระบบก่อนจึงจะอัปโหลดได้</p>
      )}
    </div>
  );
}
