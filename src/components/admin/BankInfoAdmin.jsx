// pages/admin/BankInfoAdmin.jsx  (iOS glass theme)
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";
const API = `${API_BASE.replace(/\/$/, "")}/api`;

const absUrl = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE.replace(/\/$/, "")}${u.startsWith("/") ? "" : "/"}${u}`;
};

const iosBlue = "#0A84FF";

const BankInfoAdmin = () => {
  const [bankInfo, setBankInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const res = await axios.get(`${API}/admin/bank-info`);
        const data = Array.isArray(res.data) ? res.data[0] : res.data || {};
        setBankInfo({
          bankName: data.bankName || "—",
          accountName: data.accountName || "—",
          accountNumber: data.accountNumber || "—",
          qrCodeImage: data.qrCodeImage || "",
          bankLogo: data.bankLogo || "",
        });
      } catch (e) {
        console.error("load bank-info error:", e);
        setErr("ไม่สามารถโหลดข้อมูลธนาคาร");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminLayout>
      {/* พื้นหลัง iOS ฟุ้งๆ */}
      <div
        className="min-h-[calc(100vh-120px)] -mx-4 -mt-2 px-4 pt-2 pb-6"
        style={{
          background:
            "radial-gradient(1200px 600px at 10% -10%, #DDEBFF 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #FEE7F4 0%, transparent 55%), linear-gradient(180deg, #FAFAFC 0%, #F4F6F9 100%)",
        }}
      >
        <div className="space-y-6 mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">จัดการข้อมูลธนาคาร</h1>
              <p className="text-gray-600 text-sm mt-1">
                กรอกหรือแก้ไขข้อมูลบัญชีที่จะใช้แสดงในหน้าชำระเงิน
              </p>
            </div>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="rounded-[22px] border border-white/30 bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5">
              กำลังโหลดข้อมูล…
            </div>
          )}
          {err && (
            <div className="rounded-[22px] border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          )}

          {/* Content */}
          {!loading && !err && bankInfo && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* ซ้าย: ข้อมูล (read-only look แบบฟอร์ม iOS) */}
              <div className="lg:col-span-2 rounded-[22px] border border-white/30 bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5">
                <div className="space-y-4">
                  <Field label="ชื่อธนาคาร">{bankInfo.bankName}</Field>
                  <Field label="เลขที่บัญชี">{bankInfo.accountNumber}</Field>
                  <Field label="ชื่อบัญชี">{bankInfo.accountName}</Field>

                  {/* ช่องอัปโหลด (mock UI เฉยๆ ถ้ายังไม่ทำอัปโหลด) */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <UploadPlaceholder label="QR Code (อัปโหลดในหน้าที่เกี่ยวข้อง)">
                      {bankInfo.qrCodeImage ? (
                        <img
                          src={absUrl(bankInfo.qrCodeImage)}
                          alt="QR Code"
                          className="h-40 w-40 rounded-2xl object-contain ring-1 ring-black/5 bg-white"
                        />
                      ) : (
                        <EmptyImg label="ไม่มี QR" w={160} h={160} />
                      )}
                    </UploadPlaceholder>

                    <UploadPlaceholder label="โลโก้ธนาคาร">
                      {bankInfo.bankLogo ? (
                        <img
                          src={absUrl(bankInfo.bankLogo)}
                          alt="Bank Logo"
                          className="h-28 w-28 rounded-2xl object-contain ring-1 ring-black/5 bg-white"
                        />
                      ) : (
                        <EmptyImg label="ไม่มีโลโก้" w={112} h={112} />
                      )}
                    </UploadPlaceholder>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-6 rounded-2xl px-5 py-2.5 font-medium text-white shadow-md transition active:scale-[.99]"
                  style={{ background: iosBlue, boxShadow: "0 6px 14px rgba(10,132,255,0.25)" }}
                >
                  อัปเดตข้อมูล
                </button>
              </div>

              {/* ขวา: สรุปที่บันทึกไว้ */}
              <div className="rounded-[22px] border border-white/30 bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5">
                <h3 className="font-semibold text-gray-900 mb-4">ข้อมูลที่บันทึกไว้</h3>
                <dl className="space-y-2 text-sm">
                  <Row name="ชื่อธนาคาร" value={bankInfo.bankName} />
                  <Row name="เลขที่บัญชี" value={bankInfo.accountNumber} />
                  <Row name="ชื่อบัญชี" value={bankInfo.accountName} />
                </dl>

                <div className="mt-6 space-y-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">QR Code</div>
                    {bankInfo.qrCodeImage ? (
                      <img
                        src={absUrl(bankInfo.qrCodeImage)}
                        alt="QR Code"
                        className="w-40 h-40 object-contain rounded-2xl ring-1 ring-black/5 bg-white"
                      />
                    ) : (
                      <EmptyImg label="ไม่มี QR" w={160} h={160} />
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">โลโก้ธนาคาร</div>
                    {bankInfo.bankLogo ? (
                      <img
                        src={absUrl(bankInfo.bankLogo)}
                        alt="Bank Logo"
                        className="w-28 h-28 object-contain rounded-2xl ring-1 ring-black/5 bg-white"
                      />
                    ) : (
                      <EmptyImg label="ไม่มีโลโก้" w={112} h={112} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-gray-500">
            โทน iOS • ฟรอสต์แก้ว • มุมโค้งใหญ่ • ring-1 • สายละมุน
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

function Row({ name, value }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="text-gray-600">{name}</dt>
      <dd className="text-gray-900 font-medium">{value}</dd>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="mt-1 rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-gray-900 shadow-inner outline-none backdrop-blur-sm ring-1 ring-black/5">
        {children}
      </div>
    </div>
  );
}

function UploadPlaceholder({ label, children }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 p-4 backdrop-blur-md ring-1 ring-black/5">
      <p className="mb-3 text-sm text-gray-700">{label}</p>
      {children}
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
