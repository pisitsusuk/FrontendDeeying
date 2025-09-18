import React, { useEffect, useMemo, useState } from "react";
import {
  Tableapproveslip,
  updateSlipStatus,
  buildImageUrl,
  deleteSlip,
} from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { numberFormat } from "../../utils/number";
import { dateFormat } from "../../utils/dateformat";

/* --- UI helpers --- */
const StatusPill = ({ value }) => {
  const s = String(value || "").toUpperCase();
  const map = {
    APPROVED: "bg-emerald-100/80 text-emerald-700 border border-emerald-300 ring-1 ring-black/5",
    REJECTED: "bg-red-100/80 text-red-700 border border-red-300 ring-1 ring-black/5",
    PENDING:  "bg-amber-100/80 text-amber-700 border border-amber-300 ring-1 ring-black/5",
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold backdrop-blur whitespace-nowrap ${map[s] || map.PENDING}`}>
      {s}
    </span>
  );
};

const Button = ({ children, color = "ghost", size="md", className = "", ...rest }) => {
  const sizeCls = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-1.5 text-sm";
  const base = `${sizeCls} rounded-xl font-medium transition shadow-sm active:scale-[.98] backdrop-blur`;
  const map = {
    ghost: "bg-white/70 text-gray-900 border border-white/60 hover:bg-white ring-1 ring-black/5",
    green: "text-white border border-emerald-700 bg-emerald-600 hover:bg-emerald-700",
    red:   "text-white border border-red-700 bg-red-600 hover:bg-red-700",
    gray:  "bg-white/60 text-gray-800 border border-white/60 hover:bg-white ring-1 ring-black/5",
    blue:  "text-white border border-blue-700 bg-[#0A84FF] hover:brightness-95 shadow-[0_6px_14px_rgba(10,132,255,0.25)]",
  };
  return (
    <button className={`${base} ${map[color]} ${className}`} {...rest}>
      {children}
    </button>
  );
};
/* --------------- */

export default function Tableappoveslip() {
  const token = useEcomStore((s) => s.token);

  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);

  const statusOptions = useMemo(
    () => [
      { value: "", label: "ทั้งหมด" },
      { value: "PENDING", label: "PENDING" },
      { value: "APPROVED", label: "APPROVED" },
      { value: "REJECTED", label: "REJECTED" },
    ],
    []
  );

  useEffect(() => { if (token) fetchData(); }, [token, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await Tableapproveslip(token, statusFilter || undefined);
      const items = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const normalized = items.map((r, i) => ({
        _id: String(r.id ?? r.slip_id ?? r._id ?? i),
        cartId: r.cartId ?? r.cart_id ?? "-",
        amount: Number(r.amount ?? r.cartTotal ?? 0),
        status: String(r.status ?? r.slipStatus ?? r.approval_status ?? "PENDING").toUpperCase(),
        slipUrl: (r.slipPath ?? r.slip_path ?? r.path) ? buildImageUrl(r.slipPath ?? r.slip_path ?? r.path) : "",
        when: r.createdAt || r.updatedAt || r.created_at || r.updated_at || null,
        products: Array.isArray(r.products) ? r.products : [],
        buyer: r.orderedBy?.email || r.raw?.orderedBy?.email || null,
        raw: r,
      }));

      setRows(normalized);
    } catch (e) {
      setError(e?.response?.data?.message || "โหลดรายการสลิปไม่สำเร็จ");
    } finally { setLoading(false); }
  };

  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));
  const toAction = (next) => (String(next).toUpperCase() === "APPROVED" ? "approve" : "reject");

  const doUpdate = async (id, next) => {
    try {
      setActingId(id);
      await updateSlipStatus(token, id, toAction(next));
      toast.success(next === "APPROVED" ? "อนุมัติแล้ว" : "ปฏิเสธแล้ว");
      await fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "อัปเดตสถานะสลิปไม่สำเร็จ");
    } finally { setActingId(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันลบสลิปนี้?")) return;
    try {
      setActingId(id);
      await deleteSlip(token, id);
      toast.success("ลบสลิปเรียบร้อย");
      await fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "ลบสลิปไม่สำเร็จ");
    } finally { setActingId(null); }
  };

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
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">รายการสลิปรอตรวจสอบ</h2>

          <div className="rounded-2xl border border-white/40 bg-white/70 p-1 backdrop-blur ring-1 ring-black/5 shadow-sm">
            <div className="flex">
              {statusOptions.map((o) => {
                const active = statusFilter === o.value;
                return (
                  <button
                    key={o.value}
                    onClick={() => setStatusFilter(o.value)}
                    className={`px-3 py-1.5 text-sm rounded-xl transition ${
                      active ? "bg-[#0A84FF] text-white shadow" : "text-gray-700 hover:bg-white/80"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button color="blue" onClick={fetchData}>รีเฟรช</Button>
          {loading && <span className="text-sm text-gray-500">กำลังโหลด…</span>}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[22px] border border-white/30 bg-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5">
          <div className="overflow-auto">
            <table className="min-w-[900px] w-full table-fixed text-sm">
              <colgroup>
                <col style={{ width: 56 }} />        {/* # */}
                <col style={{ width: "26%" }} />     {/* วันที่ */}
                <col style={{ width: "9%" }} />      {/* Cart */}
                <col style={{ width: "14%" }} />     {/* ยอด */}
                <col style={{ width: "10%" }} />     {/* สลิป */}
                <col style={{ width: "14%" }} />     {/* สถานะ */}
                <col style={{ width: "27%" }} />     {/* จัดการ (กว้างขึ้น) */}
              </colgroup>

              <thead className="sticky top-0 z-10 backdrop-blur-xl">
                <tr className="bg-white/70 text-gray-800 [&>th]:p-3 [&>th]:font-semibold">
                  <th className="text-center">#</th>
                  <th className="text-left">วันที่</th>
                  <th className="text-center">Cart</th>
                  <th className="text-right">ยอด</th>
                  <th className="text-center">สลิป</th>
                  <th className="text-center">สถานะ</th>
                  <th className="text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-red-600">{error}</td>
                  </tr>
                )}

                {!loading && !error && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-500">ไม่พบสลิปตามเงื่อนไขที่เลือก</td>
                  </tr>
                )}

                {rows.map((r, i) => (
                  <React.Fragment key={r._id}>
                    <tr className="border-t border-white/50 hover:bg-white/60">
                      <td className="p-3 text-center text-gray-700">{i + 1}</td>
                      <td className="p-3 text-left">
                        <div className="font-medium text-gray-900">
                          {r.when ? dateFormat(r.when) : <span className="text-gray-400">—</span>}
                        </div>
                        {r.buyer && <div className="text-xs text-gray-500">{r.buyer}</div>}
                      </td>
                      <td className="p-3 text-center text-gray-900">{r.cartId}</td>
                      <td className="p-3 text-right font-semibold text-gray-900">{numberFormat(r.amount)}</td>
                      <td className="p-3 text-center">
                        {r.slipUrl ? (
                          <a href={r.slipUrl} target="_blank" rel="noreferrer">
                            <img
                              src={r.slipUrl}
                              alt="slip"
                              className="mx-auto h-10 w-10 rounded-xl object-cover ring-1 ring-black/5 shadow"
                            />
                          </a>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="p-3 text-center">
                        <StatusPill value={r.status} />
                      </td>

                      {/* ACTIONS */}
                      <td className="p-3">
                          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                            {/* ปุ่มสถานะ (ถ้ามี) ไว้ซ้าย */}
                            {r.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  color="green"
                                  onClick={() => doUpdate(r._id, "APPROVED")}
                                  disabled={actingId === r._id}
                                >
                                  อนุมัติ
                                </Button>
                                <Button
                                  size="sm"
                                  color="red"
                                  onClick={() => doUpdate(r._id, "REJECTED")}
                                  disabled={actingId === r._id}
                                >
                                  ปฏิเสธ
                                </Button>
                              </>
                            )}

                            {/* ดูสินค้า ข้างๆ ปุ่มลบ */}
                            <Button size="sm" color="ghost" onClick={() => toggle(r._id)}>
                              {open[r._id] ? "ซ่อน" : "ดูสินค้า"}
                            </Button>

                            {/* ลบ ขวาสุด */}
                            <Button
                              size="sm"
                              color="gray"
                              className="ml-auto"
                              onClick={() => handleDelete(r._id)}
                              disabled={actingId === r._id}
                            >
                              ลบ
                            </Button>
                          </div>
                        </td>

                    </tr>

                    {open[r._id] && (
                      <tr className="border-t border-white/60 bg-white/60">
                        <td className="p-4" colSpan={7}>
                          {Array.isArray(r.products) && r.products.length ? (
                            <div className="rounded-2xl border border-white/50 bg-white/70 backdrop-blur ring-1 ring-black/5 shadow-sm">
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
                                  {r.products.map((p, idx) => {
                                    const title = p.title || p.product?.title || "-";
                                    const price = Number(p.price ?? p.product?.price ?? 0);
                                    const qty = Number(p.qty ?? p.count ?? 0);
                                    return (
                                      <tr key={idx} className="border-t border-white/60">
                                        <td className="p-2 text-left text-gray-900">{title}</td>
                                        <td className="p-2 text-right text-gray-900">{numberFormat(price)}</td>
                                        <td className="p-2 text-right text-gray-900">{qty}</td>
                                        <td className="p-2 text-right text-gray-900">{numberFormat(price * qty)}</td>
                                      </tr>
                                    );
                                  })}
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
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
