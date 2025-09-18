// pages/admin/BankInfoAdmin.jsx  — iOS glass theme
import React, { useState, useEffect } from "react";
import axios from "axios";

// reset header กัน axios ใส่ Content-Type ผิด
try {
  delete axios.defaults.headers.post["Content-Type"];
  delete axios.defaults.headers.put["Content-Type"];
  delete axios.defaults.headers.common["Content-Type"];
} catch {}

const API_BASE = "https://backenddeeying.onrender.com";
const iosBlue = "#0A84FF";

const BankInfoAdmin = () => {
  const [bankInfo, setBankInfo] = useState({
    id: null,
    bankName: "",
    accountNumber: "",
    accountName: "",
    qrCodeImage: "",
    bankLogo: "",
  });

  const [files, setFiles] = useState({ qrCodeImage: null, bankLogo: null });
  const [previews, setPreviews] = useState({ qrCodeImage: "", bankLogo: "" });

  const serverImage = (webPath) =>
    webPath?.startsWith("/") ? `${API_BASE}${webPath}` : webPath || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankInfo((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    const file = fileList?.[0] || null;
    setFiles((p) => ({ ...p, [name]: file }));
    setPreviews((p) => ({ ...p, [name]: file ? URL.createObjectURL(file) : "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isCreate = !bankInfo.id;

    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (isCreate) {
      if (!(files.qrCodeImage instanceof File) || !(files.bankLogo instanceof File)) {
        alert("กรุณาเลือกไฟล์ QR และโลโก้");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("bankName", bankInfo.bankName);
      formData.append("accountNumber", bankInfo.accountNumber);
      formData.append("accountName", bankInfo.accountName);

      if (files.qrCodeImage instanceof File) formData.append("qrCodeImage", files.qrCodeImage);
      if (files.bankLogo instanceof File) formData.append("bankLogo", files.bankLogo);

      // debug
      for (const [k, v] of formData.entries()) {
        console.log("FormData:", k, v instanceof File ? `File(${v.name}, ${v.size} bytes)` : v);
      }

      const url = isCreate
        ? `${API_BASE}/api/admin/bank-info`
        : `${API_BASE}/api/admin/bank-info/${bankInfo.id}`;
      const method = isCreate ? "post" : "put";

      const res = await axios[method](url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const payload = res.data?.data || res.data || {};
      alert(isCreate ? "เพิ่มข้อมูลธนาคารสำเร็จ" : "อัปเดตข้อมูลธนาคารสำเร็จ");

      setBankInfo((p) => ({
        ...p,
        id: payload.id ?? p.id,
        bankName: payload.bankName ?? p.bankName,
        accountNumber: payload.accountNumber ?? p.accountNumber,
        accountName: payload.accountName ?? p.accountName,
        qrCodeImage: payload.qrCodeImage ?? p.qrCodeImage,
        bankLogo: payload.bankLogo ?? p.bankLogo,
      }));

      setFiles({ qrCodeImage: null, bankLogo: null });
      setPreviews({ qrCodeImage: "", bankLogo: "" });
    } catch (error) {
      console.error("Upload Error:", error?.response?.data || error.message);
      alert(error?.response?.data?.error || "Server error");
    }
  };

  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const r = await axios.get(`${API_BASE}/api/admin/bank-info`);
        const row = Array.isArray(r.data) ? r.data[0] : r.data;
        if (row) {
          setBankInfo((p) => ({
            ...p,
            id: row.id ?? null,
            bankName: row.bankName ?? "",
            accountNumber: row.accountNumber ?? "",
            accountName: row.accountName ?? "",
            qrCodeImage: row.qrCodeImage ?? "",
            bankLogo: row.bankLogo ?? "",
          }));
        }
      } catch (err) {
        console.error("โหลด bank info ไม่ได้", err?.response?.data || err.message);
      }
    };
    fetchBankInfo();
  }, []);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, #DDEBFF 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #FEE7F4 0%, transparent 55%), linear-gradient(180deg, #FAFAFC 0%, #F4F6F9 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl p-6 lg:p-10 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">จัดการข้อมูลธนาคาร</h1>
          <p className="text-gray-600 text-sm mt-1">
            กรอก/แก้ไขข้อมูลบัญชีสำหรับหน้าชำระเงิน (ฟีล iOS ละมุนๆ)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ฟอร์ม */}
          <div className="rounded-[22px] border border-white/30 bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-700">ชื่อธนาคาร</label>
                <input
                  type="text"
                  name="bankName"
                  value={bankInfo.bankName}
                  onChange={handleChange}
                  placeholder="ไทยพาณิชย์ / กสิกร ฯลฯ"
                  className="mt-1 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">เลขที่บัญชี</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankInfo.accountNumber}
                  onChange={handleChange}
                  placeholder="เลขที่บัญชี"
                  className="mt-1 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">ชื่อบัญชี</label>
                <input
                  type="text"
                  name="accountName"
                  value={bankInfo.accountName}
                  onChange={handleChange}
                  placeholder="ชื่อ-นามสกุลเจ้าของบัญชี"
                  className="mt-1 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* QR */}
                <div className="rounded-2xl border border-white/40 bg-white/60 p-4 backdrop-blur-md ring-1 ring-black/5">
                  <label className="text-sm text-gray-700">QR Code</label>
                  <input
                    type="file"
                    name="qrCodeImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm"
                  />
                  {(previews.qrCodeImage || bankInfo.qrCodeImage) && (
                    <img
                      src={previews.qrCodeImage || serverImage(bankInfo.qrCodeImage)}
                      alt="QR preview"
                      className="mt-3 h-40 w-40 rounded-2xl object-contain ring-1 ring-black/5 bg-white"
                    />
                  )}
                </div>

                {/* Logo */}
                <div className="rounded-2xl border border-white/40 bg-white/60 p-4 backdrop-blur-md ring-1 ring-black/5">
                  <label className="text-sm text-gray-700">รูปโลโก้ธนาคาร</label>
                  <input
                    type="file"
                    name="bankLogo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm"
                  />
                  {(previews.bankLogo || bankInfo.bankLogo) && (
                    <img
                      src={previews.bankLogo || serverImage(bankInfo.bankLogo)}
                      alt="Logo preview"
                      className="mt-3 h-28 w-28 rounded-2xl object-contain ring-1 ring-black/5 bg-white"
                    />
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="rounded-2xl px-5 py-2.5 font-medium text-white shadow-md transition active:scale-[.99]"
                  style={{ background: iosBlue, boxShadow: "0 6px 14px rgba(10,132,255,0.25)" }}
                >
                  {bankInfo.id ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>

          {/* แสดงผล */}
          <div className="rounded-[22px] border border-white/30 bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">ข้อมูลที่บันทึกไว้</h2>

            <InfoRow label="ชื่อธนาคาร" value={bankInfo.bankName || "—"} />
            <InfoRow label="เลขที่บัญชี" value={bankInfo.accountNumber || "—"} />
            <InfoRow label="ชื่อบัญชี" value={bankInfo.accountName || "—"} />

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-2">QR Code</div>
                {(previews.qrCodeImage || bankInfo.qrCodeImage) ? (
                  <img
                    src={previews.qrCodeImage || serverImage(bankInfo.qrCodeImage)}
                    alt="QR Code"
                    className="h-40 w-40 rounded-2xl object-contain ring-1 ring-black/5 bg-white"
                  />
                ) : (
                  <EmptyImg label="ไม่มี QR" w={160} h={160} />
                )}
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-2">โลโก้ธนาคาร</div>
                {(previews.bankLogo || bankInfo.bankLogo) ? (
                  <img
                    src={previews.bankLogo || serverImage(bankInfo.bankLogo)}
                    alt="Bank Logo"
                    className="h-28 w-28 rounded-2xl object-contain ring-1 ring-black/5 bg-white"
                  />
                ) : (
                  <EmptyImg label="ไม่มีโลโก้" w={112} h={112} />
                )}
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

function InfoRow({ label, value }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-6">
      <div className="text-gray-600 text-sm">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}

function EmptyImg({ label = "ไม่มีรูป", w = 160, h = 160 }) {
  return (
    <div
      className="rounded-2xl border border-dashed border-gray-300 bg-white/70 flex items-center justify-center text-gray-400 text-sm ring-1 ring-black/5"
      style={{ width: w, height: h }}
    >
      {label}
    </div>
  );
}

export default BankInfoAdmin;
