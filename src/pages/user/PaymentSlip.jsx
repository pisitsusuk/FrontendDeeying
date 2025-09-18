// client/src/pages/user/PaymentSlip.jsx
import React, { useState, useEffect, useMemo, useId } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const API_BASE =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API || "https://backenddeeying.onrender.com";
const API = `${API_BASE.replace(/\/$/, "")}/api`;

// แปลง path จากแบ็คเอนด์ให้เป็น URL เต็ม
const toUrl = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const base = API_BASE.replace(/\/$/, "");
  return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
};

export default function PaymentSlip() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const token = useEcomStore((s) => s.token);
  const clearCart = useEcomStore((s) => s.clearCart); // ✅ ใช้เคลียร์ตะกร้า

  const cartIdFromUrl = sp.get("cart_id") || "";
  const amountFromUrl = sp.get("amount");

  const [cartId, setCartId] = useState(cartIdFromUrl);
  const [amount, setAmount] = useState(
    amountFromUrl !== null ? Number(amountFromUrl) : Number(localStorage.getItem("pay_total") || 0)
  );
  const [shippingAddress, setShippingAddress] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [inputKey, setInputKey] = useState(0);

  const [bankInfo, setBankInfo] = useState({
    bankName: "ไม่มีข้อมูล",
    accountNumber: "ไม่มีข้อมูล",
    accountName: "ไม่มีข้อมูล",
    qrCodeImage: "",
    bankLogo: "",
  });

  const inputId = useId();
  const disabled = useMemo(
    () => !String(cartId).trim() || Number.isNaN(amount) || amount <= 0 || !file || loading,
    [cartId, amount, file, loading]
  );

  // โหลดข้อมูลธนาคาร
  const fetchBankInfo = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/bank-info`);
      setBankInfo(
        Array.isArray(data) && data.length
          ? data[0]
          : data || {
              bankName: "ไม่มีข้อมูล",
              accountNumber: "ไม่มีข้อมูล",
              accountName: "ไม่มีข้อมูล",
              qrCodeImage: "",
              bankLogo: "",
            }
      );
    } catch (e) {
      console.error("ไม่สามารถดึงข้อมูลธนาคารได้", e);
      setMsg("ไม่สามารถดึงข้อมูลธนาคารได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankInfo();
  }, []);

  const handleFile = (f) => {
    if (!f) {
      setFile(null);
      setPreview("");
      return;
    }
    const okType =
      f.type === "image/jpeg" ||
      f.type === "image/png" ||
      f.type === "image/webp" ||
      f.type === "application/pdf" ||
      /\.(heic|heif)$/i.test(f.name);
    if (!okType) {
      toast.error("ไฟล์ต้องเป็น JPG/PNG/WebP/HEIC/HEIF หรือ PDF");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      toast.error("ไฟล์ต้องไม่เกิน 5MB");
      return;
    }
    setFile(f);
    const looksLikeImage =
      (f.type && f.type.startsWith("image/")) ||
      /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(f.name);
    setPreview(looksLikeImage ? URL.createObjectURL(f) : "");
  };

  const onFileChange = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("กรุณาแนบไฟล์สลิป");

    const cid = String(cartId).trim();
    const amt = Number(amount);
    if (!cid) return toast.error("กรุณากรอก Cart ID");
    if (!Number.isFinite(amt) || amt <= 0) return toast.error("ยอดชำระไม่ถูกต้อง");

    const formData = new FormData();
    formData.append("cart_id", cid);
    formData.append("amount", amt);
    formData.append("slip", file);
    if (shippingAddress.trim()) {
      formData.append("shipping_address", shippingAddress.trim());
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/payments/slip`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        onUploadProgress: ({ loaded, total }) => {
          if (!total) return;
          setProgress(Math.round((loaded / total) * 100));
        },
      });

      // ✅ สำเร็จ: ล้างตะกร้า + เคลียร์ pay_total + ไปหน้าประวัติ
      toast.success(res.data?.message || "อัปโหลดสำเร็จ");
      clearCart();
      try { localStorage.removeItem("pay_total"); } catch {}
      setFile(null);
      setPreview("");
      setShippingAddress("");
      navigate("/user/history");
    } catch (err) {
      console.error("upload slip error:", err?.response?.data || err);
      toast.error(err?.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const item = e.dataTransfer.items?.[0];
    if (item && item.kind === "file") handleFile(item.getAsFile());
    else handleFile(e.dataTransfer.files?.[0]);
    setInputKey((k) => k + 1);
  };

  return (
    <div className="ps-wrap">
      <form className="ps-card" onSubmit={submit} encType="multipart/form-data">
        <div className="ps-header">
          <div className="ps-title">แนบสลิปชำระเงิน</div>
          <div className="ps-sub">รองรับ JPG / PNG / WebP / HEIC / HEIF / PDF ขนาดไม่เกิน 5MB</div>
        </div>

        {/* ข้อมูล Cart ที่ “แก้ไม่ได้” */}
        <div className="ps-grid">
          <div className="ps-field">
            <label>เลขที่ตะกร้า (Cart ID)</label>
            <input
              className="ps-input ps-input-locked"
              value={cartId}
              readOnly
              aria-readonly="true"
              onFocus={(e) => e.target.blur()}
            />
          </div>
          <div className="ps-field">
            <label>ยอดชำระ (บาท)</label>
            <input
              className="ps-input ps-input-locked"
              value={Number.isNaN(amount) ? "" : amount}
              readOnly
              aria-readonly="true"
              onFocus={(e) => e.target.blur()}
            />
          </div>
          <div className="ps-field" style={{ gridColumn: "1 / -1" }} />
        </div>

        {/* ข้อมูลธนาคาร + QR */}
        <div className="ps-bank">
          <div className="ps-bank-left">
            <div className="ps-bank-header">
              {bankInfo.bankLogo && (
                <img className="ps-bank-logo" src={toUrl(bankInfo.bankLogo)} alt="bank" loading="lazy" />
              )}
              <div className="ps-bank-name">{bankInfo.bankName || "—"}</div>
            </div>

            <div className="ps-bank-line">
              <span className="ps-bank-label">ชื่อบัญชี:</span>
              <span className="ps-bank-value">{bankInfo.accountName || "—"}</span>
            </div>
            <div className="ps-bank-line">
              <span className="ps-bank-label">เลขที่บัญชี:</span>
              <span className="ps-bank-value">{bankInfo.accountNumber || "—"}</span>
            </div>
          </div>

          {bankInfo.qrCodeImage && (
            <div className="ps-bank-qr">
              <img
                className="ps-bank-qr-img"
                src={toUrl(bankInfo.qrCodeImage)}
                alt="QR Code"
                title="สแกนเพื่อชำระ"
              />
              <div className="ps-bank-qr-cap">สแกนเพื่อชำระ</div>
            </div>
          )}
        </div>

        {/* อัปโหลดไฟล์ */}
        <div
          className={`ps-drop ${file ? "ps-drop-hasfile" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="ps-drop-ui">
            <div className="ps-drop-icon">⬆</div>
            <div className="ps-drop-title">ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์</div>
            <div className="ps-drop-sub">JPG / PNG / WebP / HEIC / HEIF / PDF (≤ 5MB)</div>
          </div>
          <input
            key={inputKey}
            id={inputId}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf"
            onChange={onFileChange}
            className="ps-file-overlay"
          />
        </div>

        {file && (
          <div className="ps-preview">
            {preview ? <img src={preview} alt="preview" /> : <div className="ps-doc">{file.name}</div>}
            <div className="ps-filemeta">
              <div className="ps-filename">{file.name}</div>
              <div className="ps-filesize">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <button
              type="button"
              className="ps-btn ps-btn-ghost"
              onClick={() => {
                setFile(null);
                setPreview("");
                setInputKey((k) => k + 1);
              }}
            >
              ล้างไฟล์
            </button>
          </div>
        )}

        {loading && (
          <div className="ps-progress">
            <div className="ps-progress-bar" style={{ width: `${progress}%` }} />
            <span className="ps-progress-text">{progress}%</span>
          </div>
        )}

        <button type="submit" className="ps-btn ps-btn-primary" disabled={disabled}>
          {loading ? "กำลังอัปโหลด…" : "ส่งสลิป"}
        </button>

        {msg && <div className="ps-msg">{msg}</div>}
      </form>
    </div>
  );
}

/* ===== CSS ===== */
const css = `
.ps-wrap{
  min-height: calc(100vh - 120px);
  background: radial-gradient(1200px 600px at 20% -10%, #f7f7ff 20%, transparent 60%),
              radial-gradient(900px 500px at 120% 10%, #f1fbf4 10%, transparent 60%),
              #fafafa;
  padding: 32px 16px;
}
.ps-card{ max-width: 860px; margin: 0 auto; background: #fff; border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,.06); padding: 24px; border: 1px solid #f1f1f1; }
.ps-header{ margin-bottom: 16px; }
.ps-title{ font-size: 22px; font-weight: 700; }
.ps-sub{ color:#6b7280; font-size: 13px; margin-top: 4px; }

.ps-grid{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 12px 0 8px; }
@media (max-width: 720px){ .ps-grid{ grid-template-columns: 1fr; } }

.ps-field label{ display:block; font-weight:600; margin-bottom:8px; }
.ps-input{
  width:100%; padding:12px 14px; border:1px solid #e5e7eb; border-radius:12px;
  outline:none; transition: box-shadow .15s, border-color .15s; background:#fbfbfd;
}
.ps-input:focus{ border-color:#6366f1; box-shadow:0 0 0 4px rgba(99,102,241,.12); }

/* 🔒 Locked (แก้ไขไม่ได้) */
.ps-input-locked{
  cursor: not-allowed;
  border-color: #e5e7eb !important;
  box-shadow: none !important;
  background: #f9fafb;
  color:#111827;
}

/* Bank block */
.ps-bank{
  display:grid; grid-template-columns: 1fr minmax(220px, 320px); gap:20px;
  align-items:center; margin:14px 0; padding:16px; border:1px solid #e5e7eb;
  border-radius:14px; background:#fff;
}
@media (max-width: 720px){ .ps-bank{ grid-template-columns: 1fr; } }

.ps-bank-header{ display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.ps-bank-logo{ width:28px; height:28px; object-fit:contain; border-radius:6px; border:1px solid #eee; }
.ps-bank-name{ font-weight:800; font-size:18px; }

.ps-bank-line{ display:flex; gap:8px; margin:6px 0; }
.ps-bank-label{ width:90px; color:#6b7280; font-weight:600; }
.ps-bank-value{ font-weight:600; }

.ps-bank-qr{ display:flex; flex-direction:column; align-items:center; justify-content:center; }
.ps-bank-qr-img{
  width:100%; max-width:340px; aspect-ratio:1/1; object-fit:contain;
  border-radius:12px; border:1px solid #e5e7eb; box-shadow:0 10px 24px rgba(0,0,0,.06);
  /* ทำให้เส้น QR คมขึ้นเวลาถูกขยาย */
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
.ps-bank-qr-cap{ margin-top:8px; font-size:12px; color:#6b7280; }

/* Dropzone */
.ps-drop{
  position:relative; border:2px dashed #d1d5db; border-radius:16px;
  padding:28px; text-align:center; margin:12px 0; background:#fcfcfe; transition: all .15s ease;
  z-index: 2147483000;
}
.ps-drop:hover{ border-color:#818cf8; background:#f8f9ff; }
.ps-drop-icon{ font-size: 28px; opacity:.75; }
.ps-drop-title{ font-weight:700; margin-top:6px; }
.ps-drop-sub{ color:#6b7280; font-size:12px; }
.ps-drop-hasfile{ border-color:#34d399; background:#f6fffb; }
.ps-drop-ui{ pointer-events:none; }
.ps-file-overlay{ position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer;
  z-index: 2147483647; pointer-events:auto; }

/* Preview */
.ps-preview{ display:flex; align-items:center; gap:14px; border:1px solid #e5e7eb; border-radius:14px;
  padding:10px 12px; background:#fff; margin:10px 0 4px; }
.ps-preview img{ width:90px; height:90px; object-fit:cover; border-radius:12px; border:1px solid #eee; }
.ps-doc{ padding:12px 14px; background:#f3f4f6; border-radius:10px; font-size:14px; }
.ps-filemeta{ flex:1; min-width:0; }
.ps-filename{ font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ps-filesize{ font-size:12px; color:#6b7280; }

.ps-progress{ position:relative; height:12px; background:#f3f4f6; border-radius:999px; overflow:hidden; margin:8px 0 4px; }
.ps-progress-bar{ height:100%; background:linear-gradient(90deg,#6366f1,#22c55e); transition:width .2s ease; }
.ps-progress-text{ position:absolute; top:-22px; right:0; font-size:12px; color:#6b7280; }

.ps-btn{ display:inline-flex; align-items:center; justify-content:center; padding:12px 16px; border-radius:12px; border:1px solid transparent; font-weight:700; cursor:pointer; transition: all .15s; }
.ps-btn:disabled{ opacity:.6; cursor:not-allowed; }
.ps-btn-primary{ width:100%; background:#111827; color:#fff; margin-top:10px; }
.ps-btn-primary:hover{ transform: translateY(-1px); box-shadow:0 8px 20px rgba(0,0,0,.08); }
.ps-msg{ margin-top:8px; color:#b91c1c; font-weight:600; }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}
