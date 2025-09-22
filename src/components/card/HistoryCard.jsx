// client/src/pages/user/HistoryCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getOrders } from "../../api/user";
import useEcomStore from "../../store/ecom-store";
import { dateFormat } from "../../utils/dateformat";
import { numberFormat } from "../../utils/number";
import { CalendarDays, MapPin, Package2, Receipt } from "lucide-react";

/* ---------- API base ---------- */  
const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";
const API = `${API_BASE.replace(/\/$/, "")}/api`;

/* ---------- utils ---------- */
const sNum = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
const sStr = (v) => (v == null ? "" : String(v));

/* address จาก order โดยตรงก่อน */
const flattenAddress = (addr) => {
  if (!addr) return "";
  if (typeof addr === "string") return addr.trim();
  if (Array.isArray(addr)) return addr.filter(Boolean).join(" ").trim();
  if (typeof addr === "object") {
    const vals = Object.values(addr).filter(Boolean).map(String);
    return vals.join(" ").trim();
  }
  return String(addr || "").trim();
};
const getOrderAddressDirect = (o) =>
  flattenAddress(
    o?.shippingAddress ??
      o?.shipping_address ??
      o?.address ??
      o?.shipping?.address ??
      o?.shipTo ??
      o?.orderedBy?.address ??
      null
  );

/* ---------- address resolver ---------- */
const normalizeAddrItem = (row) => ({
  cartId: row?.cartId ?? row?.cart_id ?? row?.cart?.id ?? null,
  amount: sNum(row?.amount ?? row?.total ?? 0, 0),
  address: sStr(row?.address ?? row?.shippingAddress ?? row?.shipping_address ?? ""),
  when: new Date(row?.updatedAt ?? row?.updated_at ?? row?.createdAt ?? row?.created_at ?? Date.now()),
});

/* ดึง list address ของผู้ใช้ (รองรับหลายรูปแบบรีสปอนส์) */
async function fetchMyAddressItems(token) {
  const headers = { Authorization: `Bearer ${token}` };
  const urls = [
    "/user/address/my",      // ที่เราเพิ่มไว้
    "/user/addresses",       // บางโปรเจ็กต์ใช้ s
  ];

  for (const u of urls) {
    try {
      const r = await axios.get(`${API}${u}`, { headers });
      const raw = r?.data?.items ?? r?.data?.data ?? r?.data ?? [];
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === "object") return [raw]; // บาง API ส่ง object เดียว
    } catch (e) {
      // 404 / 401 ก็แค่ข้ามไปลองอันถัดไป
    }
  }
  return [];
}

/* resolve address รายออเดอร์ (ถ้ามี endpoint) */
async function resolveAddressForOrder(token, order) {
  const headers = { Authorization: `Bearer ${token}` };
  const cartId =
    order?.cartId ?? order?.cart_id ?? order?.cart?.id ?? order?.cart_id_ref ?? null;
  const amount = sNum(order?.cartTotal, 0);
  const when = new Date(order?.updatedAt || order?.createdAt || Date.now()).toISOString();

  const urls = [
    `/user/address/resolve?cartId=${encodeURIComponent(cartId ?? "")}&amount=${encodeURIComponent(amount)}&when=${encodeURIComponent(when)}`,
  ];

  for (const u of urls) {
    try {
      const r = await axios.get(`${API}${u}`, { headers });
      const addr = r?.data?.address ?? r?.data?.data?.address ?? r?.data?.addr;
      if (addr && String(addr).trim()) return String(addr).trim();
    } catch {
      // ไม่มีก็ข้าม
    }
  }
  return "";
}

/* สร้างฟังก์ชัน resolve จากรายการ address ทั้งหมด */
const makeAddressResolver = (items) => {
  const list = (items || []).map(normalizeAddrItem);

  // เก็บรายการล่าสุดต่อ cartId
  const latestByCart = new Map();
  for (const it of list) {
    if (it.cartId == null || !it.address?.trim()) continue;
    const k = String(it.cartId);
    const prev = latestByCart.get(k);
    if (!prev || +it.when > +prev.when) latestByCart.set(k, it);
  }

  return (order) => {
    const cartId =
      order?.cartId ?? order?.cart_id ?? order?.cart?.id ?? order?.cart_id_ref ?? null;

    // 1) by cartId
    if (cartId != null) {
      const hit = latestByCart.get(String(cartId));
      if (hit?.address?.trim()) return hit.address.trim();
    }

    // 2) heuristic: match ด้วยยอด + เวลาใกล้กัน
    const total = sNum(order?.cartTotal, NaN);
    const oTime = new Date(order?.updatedAt || order?.createdAt || Date.now());
    const MAX_DIFF = 5 * 24 * 60 * 60 * 1000; // 5 วัน

    let best = "";
    let bestDiff = Infinity;
    for (const it of list) {
      if (!it.address?.trim()) continue;
      if (Number.isFinite(total) && Math.abs(it.amount - total) < 0.005) {
        const diff = Math.abs(it.when - oTime);
        if (diff <= MAX_DIFF && diff < bestDiff) {
          best = it.address.trim();
          bestDiff = diff;
        }
      }
    }
    return best;
  };
};

/* ---------- UI ---------- */
const Pill = ({ tone = "gray", children }) => {
  const map = {
    gray: "bg-gray-100/80 text-gray-700 border border-gray-200",
    blue: "bg-blue-100/80 text-blue-700 border border-blue-300",
    amber: "bg-amber-100/80 text-amber-700 border border-amber-300",
    green: "bg-emerald-100/80 text-emerald-700 border border-emerald-300",
    red: "bg-rose-100/80 text-rose-700 border border-rose-300",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur ${map[tone]}`}>{children}</span>;
};
const toneFromStatus = (s) => {
  const v = String(s || "").toLowerCase();
  if (/(approved|complete|completed|success|done)/.test(v)) return "green";
  if (/(rejected|reject|cancel|cancelled|failed|fail)/.test(v)) return "red";
  if (/(processing|process|in\s*progress)/.test(v)) return "blue";
  if (/(pending|wait|waiting)/.test(v)) return "amber";
  return "gray";
};

export default function HistoryCard() {
  const token = useEcomStore((s) => s.token);
  const [orders, setOrders] = useState([]);
  const [addrResolver, setAddrResolver] = useState(() => () => "");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        // 1) โหลดออเดอร์ของผู้ใช้
        const r = await getOrders(token);
        const list = r?.data?.orders || r?.data?.data || r?.data || [];
        const ordersArr = Array.isArray(list) ? list : [];
        setOrders(ordersArr);

        // 2) ลองดึง list address ของฉัน (ไม่ต้องเป็นแอดมิน)
        const myAddrItems = await fetchMyAddressItems(token);
        let resolver = makeAddressResolver(myAddrItems);

        // 3) ถ้าออเดอร์ไหนยังว่าง → ยิง /user/address/resolve เป็นรายใบ
        const missingIdx = [];
        ordersArr.forEach((o, i) => {
          const direct = getOrderAddressDirect(o);
          if (direct) return; // มีใน order เองแล้ว
          const addr = resolver(o);
          if (!addr) missingIdx.push(i);
        });

        if (missingIdx.length) {
          const resolvedAdds = await Promise.all(
            missingIdx.map((i) => resolveAddressForOrder(token, ordersArr[i]))
          );

          // รวมที่แก้ได้เข้า items แล้วสร้าง resolver ใหม่
          const extra = resolvedAdds
            .map((address, j) => ({
              cartId:
                ordersArr[missingIdx[j]]?.cartId ??
                ordersArr[missingIdx[j]]?.cart_id ??
                ordersArr[missingIdx[j]]?.cart?.id ??
                null,
              amount: sNum(ordersArr[missingIdx[j]]?.cartTotal, 0),
              address,
              when: new Date(ordersArr[missingIdx[j]]?.updatedAt || ordersArr[missingIdx[j]]?.createdAt || Date.now()),
            }))
            .filter((x) => x.address && x.address.trim());

          resolver = makeAddressResolver([...myAddrItems, ...extra]);
        }

        setAddrResolver(() => resolver);
      } catch (e) {
        setErr(e?.response?.data?.message || "โหลดประวัติไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) return <div className="py-10 text-center text-gray-500">กำลังโหลดประวัติ…</div>;
  if (err) return <div className="py-10 text-center text-rose-600">{err}</div>;

  return (
    <div
      className="min-h-[70vh] w-full"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, #F7F7FF 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #F2FBF6 0%, transparent 55%), linear-gradient(180deg, #FAFAFC 0%, #F5F7FA 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 mb-4">
          ประวัติการสั่งซื้อ
        </h1>

        {!orders?.length && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-8 text-center text-gray-500 backdrop-blur">
            ยังไม่มีประวัติการสั่งซื้อ
          </div>
        )}

        <div className="space-y-6">
          {orders.map((item, idx) => {
            const address = getOrderAddressDirect(item) || addrResolver(item);
            const orderStatus = String(item.orderStatus || "");
            const slipStatus = String(item.slipStatus || "pending");

            return (
              <div
                key={item.id ?? idx}
                className="overflow-hidden rounded-[24px] border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
              >
                {/* Header */}
                <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-gray-800">
                    <div className="h-10 w-10 grid place-items-center rounded-xl bg-white/80 ring-1 ring-black/5">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">สั่งซื้อเมื่อ</div>
                      <div className="font-semibold">
                        {dateFormat(item.updatedAt || item.createdAt)}
                      </div>
                      {!!item.id && (
                        <div className="text-xs text-gray-500">Order #{item.id}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                  {orderStatus && <Pill tone={toneFromStatus(orderStatus)}>{orderStatus}</Pill>}
                  <Pill tone={toneFromStatus(slipStatus)}>{slipStatus}</Pill>
                  </div>

                </div>

                {/* Address */}
                <div className="px-5 pb-2">
                  <div className="rounded-2xl border border-white/60 bg-white/70 p-3 ring-1 ring-black/5">
                    <div className="flex items-center gap-2 pb-2 text-gray-700">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="font-medium">ที่อยู่จัดส่ง</span>
                    </div>
                    <div className="rounded-xl bg-gray-50/70 text-gray-900 px-4 py-3 ring-1 ring-black/5 whitespace-pre-wrap">
                      {address ? address : "ไม่พบที่อยู่จัดส่งที่บันทึกไว้"}
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-2 text-gray-700">
                    <Package2 size={16} />
                    <span className="font-medium">สินค้า</span>
                  </div>

                  {item.products?.length ? (
                    <div className="overflow-auto rounded-2xl border border-white/60 bg-white/70 ring-1 ring-black/5">
                      <table className="w-full text-sm">
                        <thead className="bg-white/70 text-gray-700 text-xs">
                          <tr className="[&>th]:p-3">
                            <th className="text-left">สินค้า</th>
                            <th className="text-right">ราคา</th>
                            <th className="text-right">จำนวน</th>
                            <th className="text-right">รวม</th>
                          </tr>
                        </thead>
                        <tbody className="[&>tr]:border-t [&>tr]:border-white/70 [&>tr:nth-child(even)]:bg-white/60">
                          {item.products.map((p, i) => {
                            const title = p.product?.title ?? p.title ?? "-";
                            const price = sNum(p.product?.price ?? p.price ?? 0);
                            const qty = sNum(p.count ?? p.qty ?? p.quantity ?? 0);
                            return (
                              <tr key={i} className="text-gray-900">
                                <td className="p-3">{title}</td>
                                <td className="p-3 text-right">{numberFormat(price)}</td>
                                <td className="p-3 text-right">{qty}</td>
                                <td className="p-3 text-right">{numberFormat(price * qty)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-3 text-sm text-gray-500 backdrop-blur">
                      ไม่มีสินค้าในออเดอร์นี้
                    </div>
                  )}

                  {/* Total */}
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Receipt size={18} className="text-gray-600" />
                    <div className="text-gray-600">ยอดสุทธิ</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {numberFormat(item.cartTotal || 0)} บาท
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
