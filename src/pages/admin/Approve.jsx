import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";
import {
  adminListSlips,
  adminUpdateSlipStatus,
  adminDeleteSlip,
  buildImageUrl,
} from "../../api/order";
import { numberFormat } from "../../utils/number";
import { dateTimeFormat } from "../../utils/dateformat";

const STATUS_FILTERS = ["", "PENDING", "APPROVED", "REJECTED"];
const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED"];

/* ------ UI helpers ------ */
const StatusPill = ({ st }) => {
  const s = String(st || "").toUpperCase();
  const map = {
    APPROVED:
      "bg-emerald-100/80 text-emerald-700 border border-emerald-300 ring-1 ring-black/5",
    REJECTED:
      "bg-red-100/80 text-red-700 border border-red-300 ring-1 ring-black/5",
    SHIPPED:
      "bg-blue-100/80 text-blue-700 border border-blue-300 ring-1 ring-black/5",
    DONE:
      "bg-emerald-100/80 text-emerald-700 border border-emerald-300 ring-1 ring-black/5",
    PENDING:
      "bg-amber-100/80 text-amber-700 border border-amber-300 ring-1 ring-black/5",
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold backdrop-blur whitespace-nowrap ${map[s] || map.PENDING}`}>
      {s}
    </span>
  );
};

const Button = ({ children, color = "ghost", size = "md", className = "", ...rest }) => {
  const sizeCls = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-1.5 text-sm";
  const base = `${sizeCls} rounded-xl font-medium transition shadow-sm active:scale-[.98] backdrop-blur`;
  const map = {
    ghost: "bg-white/70 text-gray-900 border border-white/60 hover:bg-white ring-1 ring-black/5",
    blue:  "text-white border border-blue-700 bg-[#0A84FF] hover:brightness-95 shadow-[0_6px_14px_rgba(10,132,255,0.25)]",
    red:   "text-white border border-red-700 bg-red-600 hover:bg-red-700",
    gray:  "bg-white/60 text-gray-800 border border-white/60 hover:bg-white ring-1 ring-black/5",
  };
  return (
    <button className={`${base} ${map[color]} ${className}`} {...rest}>
      {children}
    </button>
  );
};
/* ----------------------- */

export default function Approve() {
  const token = useEcomStore((s) => s.token);
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState({});
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);

  useEffect(() => { if (token) fetchRows(); }, [token, status]);

  const normalizeProduct = (p) => {
    const title = p?.product?.title ?? p?.title ?? "-";
    const price = Number(p?.product?.price ?? p?.price ?? 0);
    const qty = Number(p?.count ?? p?.qty ?? p?.quantity ?? 0);
    return { title, price, qty, sum: price * qty };
  };
  const extractProducts = (it) => {
    const list = it?.products || it?.items || it?.orderItems || it?.order_items || [];
    return Array.isArray(list) ? list.map(normalizeProduct) : [];
  };

  const fetchRows = async () => {
    setLoading(true);
    try {
      const { data } = await adminListSlips(token, status || undefined);
      const arr = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      const normalized = arr.map((it) => ({
        ...it,
        cartId: it.cartId ?? it.cart_id ?? it.cart?.id ?? "-",
        status: String(it.status ?? it.slipStatus ?? "PENDING").toUpperCase(),
        slip_path: it.slip_path ?? it.slipUrl ?? it.slip_url ?? "",
        products: extractProducts(it),
        userId: it.userId ?? it.user_id ?? it.user?.id ?? null,
        userName: it.userName ?? it.user_name ?? it.user?.name ?? "",
        userEmail: it.userEmail ?? it.user_email ?? it.user?.email ?? "",
        shippingAddress: it.shippingAddress ?? it.shipping_address ?? it.address ?? null,
      }));
      setRows(normalized);
    } catch (e) {
      toast.error(e?.response?.data?.message || "โหลดข้อมูลสลิปล้มเหลว");
    } finally { setLoading(false); }
  };

  const toggleRow = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const onChangeStatus = async (row, nextRaw) => {
    if (!token) return toast.error("โปรดล็อกอินอีกครั้ง");
    const next = String(nextRaw || "").toUpperCase();
    if (!STATUS_OPTIONS.includes(next)) return toast.error("สถานะไม่ถูกต้อง");

    const prev = row.status;
    setActingId(row.id);
    setRows((arr) => arr.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
    try {
      await adminUpdateSlipStatus(token, row.id, next);
      toast.success("อัปเดตสถานะแล้ว");
    } catch (e) {
      setRows((arr) => arr.map((r) => (r.id === row.id ? { ...r, status: prev } : r)));
      toast.error(e?.response?.data?.message || "อัปเดตสถานะไม่สำเร็จ");
    } finally { setActingId(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันลบสลิปนี้?")) return;
    try {
      setActingId(id);
      await adminDeleteSlip(token, id);
      toast.success("ลบสลิปเรียบร้อย");
      fetchRows();
    } catch (e) {
      toast.error(e?.response?.data?.message || "ลบสลิปไม่สำเร็จ");
    } finally { setActingId(null); }
  };

  const renderUser = (r) => {
    const name = r.userName?.trim();
    const email = r.userEmail?.trim();
    if (name && email) return `${name} (${email})`;
    if (name) return name;
    if (email) return email;
    return r.userId ? `User#${r.userId}` : "-";
  };

  const COLS = 8;

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, #DDEBFF 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #FEE7F4 0%, transparent 55%), linear-gradient(180deg, #FAFAFC 0%, #F4F6F9 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl p-6 lg:p-10">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">รายการสลิป</h2>

          <div className="rounded-2xl border border-white/40 bg-white/70 p-1 backdrop-blur ring-1 ring-black/5 shadow-sm">
            <div className="flex">
              {STATUS_FILTERS.map((s) => {
                const label = s || "ทั้งหมด";
                const active = status === s;
                return (
                  <button
                    key={label}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1.5 text-sm rounded-xl transition ${
                      active ? "bg-[#0A84FF] text-white shadow" : "text-gray-700 hover:bg-white/80"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button color="blue" onClick={fetchRows}>รีเฟรช</Button>
          {loading && <span className="text-sm text-gray-500">กำลังโหลด…</span>}
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-[22px] border border-white/30 bg-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5">
          <div className="overflow-auto">
            <table className="w-full table-fixed text-sm min-w-[920px]">
              <colgroup>
                <col style={{ width: 56 }} />        {/* # */}
                <col style={{ width: "18%" }} />     {/* วันที่ */}
                <col style={{ width: "8%" }} />      {/* Cart */}
                <col style={{ width: "20%" }} />     {/* ผู้ใช้ */}
                <col style={{ width: "12%" }} />     {/* ยอด */}
                <col style={{ width: "10%" }} />     {/* สลิป */}
                <col style={{ width: "12%" }} />     {/* สถานะ */}
                <col style={{ width: "20%" }} />     {/* จัดการ (กว้างขึ้น) */}
              </colgroup>

              <thead className="sticky top-0 z-10 backdrop-blur-xl">
                <tr className="bg-white/70 text-gray-800 [&>th]:p-3 [&>th]:font-semibold">
                  <th className="text-center">#</th>
                  <th className="text-left">วันที่</th>
                  <th className="text-left">Cart</th>
                  <th className="text-left">ผู้ใช้</th>
                  <th className="text-right">ยอด</th>
                  <th className="text-center">สลิป</th>
                  <th className="text-center">สถานะ</th>
                  <th className="text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((s, idx) => (
                  <React.Fragment key={s.id}>
                    <tr className="border-t border-white/50 hover:bg-white/60">
                      <td className="p-3 text-center text-gray-700">{idx + 1}</td>
                      <td className="p-3">
                        {s.createdAt || s.updatedAt ? (
                           <div className="font-medium text-gray-900">
                             {dateTimeFormat(s.createdAt || s.updatedAt)}
                           </div>
                             ) : <span className="text-gray-400">—</span>}
                        {s.userEmail && <div className="text-xs text-gray-500">{s.userEmail}</div>}
                      </td>
                      <td className="p-3 text-gray-900">{s.cartId}</td>
                      <td className="p-3 text-gray-900">{renderUser(s)}</td>
                      <td className="p-3 text-right font-semibold text-gray-900">
                        {numberFormat(s.amount)}
                      </td>
                      <td className="p-3 text-center">
                        {s.slip_path ? (
                          <a href={buildImageUrl(s.slip_path)} target="_blank" rel="noreferrer">
                            <img
                              src={buildImageUrl(s.slip_path)}
                              alt="slip"
                              className="mx-auto h-10 w-10 rounded-xl object-cover ring-1 ring-black/5 shadow"
                            />
                          </a>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="p-3 text-center">
                        <StatusPill st={s.status} />
                      </td>

                      {/* ACTIONS */}
                      <td className="p-3">
                          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                            {/* dropdown สถานะ อยู่ซ้ายสุด */}
                            <select
                              className={`w-[132px] sm:w-[160px] shrink-0 px-2 py-1.5 rounded-xl text-xs sm:text-sm border ${
                                actingId === s.id ? "cursor-not-allowed opacity-60" : "bg-white/70 backdrop-blur"
                              }`}
                              disabled={actingId === s.id}
                              value={s.status}
                              onChange={(e) => onChangeStatus(s, e.target.value)}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>

                            {/* ดูสินค้า ข้างๆ ปุ่มลบ */}
                            <Button size="sm" color="ghost" onClick={() => toggleRow(s.id)}>
                              {open[s.id] ? "ซ่อนสินค้า" : "ดูสินค้า"}
                            </Button>

                            {/* ลบ ขวาสุด */}
                            <Button
                              size="sm"
                              color="gray"
                              className="ml-auto"
                              onClick={() => handleDelete(s.id)}
                              disabled={actingId === s.id}
                              title="ลบสลิป"
                            >
                              ลบ
                            </Button>
                          </div>
                        </td>
                    </tr>

                    {open[s.id] && (
                      <tr className="border-t border-white/60 bg-white/60">
                        <td colSpan={COLS} className="p-4 space-y-3">
                          <div className="rounded-2xl border border-white/50 bg-white/70 p-3 backdrop-blur ring-1 ring-black/5">
                            <p className="mb-1 text-sm font-medium text-gray-700">ที่อยู่จัดส่ง</p>
                            <p className="whitespace-pre-wrap text-gray-900">
                              {s.shippingAddress || "—"}
                            </p>
                          </div>

                          {s.products?.length ? (
                            <div className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur ring-1 ring-black/5">
                              <div className="border-b border-white/60 bg-white/70 px-3 py-2 text-sm font-semibold text-gray-800">
                                รายการสินค้า
                              </div>
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-white/60 text-gray-700 text-xs [&>th]:p-2">
                                    <th className="text-left">สินค้า</th>
                                    <th className="text-right">ราคา</th>
                                    <th className="text-right">จำนวน</th>
                                    <th className="text-right">รวม</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {s.products.map((p, i) => (
                                    <tr key={i} className="border-t border-white/60">
                                      <td className="p-2 text-left text-gray-900">{p.title}</td>
                                      <td className="p-2 text-right text-gray-900">{numberFormat(p.price)}</td>
                                      <td className="p-2 text-right text-gray-900">{p.qty}</td>
                                      <td className="p-2 text-right text-gray-900">{numberFormat(p.sum)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-3 text-sm text-gray-500 backdrop-blur">
                              ไม่มีรายการสินค้า
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

                {rows.length === 0 && !loading && (
                  <tr>
                    <td colSpan={COLS} className="p-8 text-center text-gray-500">ไม่พบสลิป</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
