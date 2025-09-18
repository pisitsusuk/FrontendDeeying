// src/pages/admin/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import axios from "axios";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API || "https://backenddeeying.onrender.com";
const API = `${API_BASE.replace(/\/$/, "")}/api`;
const fmt = new Intl.NumberFormat("th-TH");
const iosBlue = "#0A84FF";

export default function Dashboard() {
  const token = useEcomStore((s) => s.token);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    kpis: { users: 0, products: 0, orders: 0, revenueApproved: 0, pending: 0 },
    salesByDay: [],
    productsByCategory: [],
    lowStock: [],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // ---------- 1) พยายามใช้ /admin/metrics ก่อน ----------
      try {
        const res = await axios.get(`${API}/admin/metrics`, { headers });
        const raw = res.data?.data ?? res.data ?? {};
        const k = raw.kpis ?? raw.KPIs ?? raw.totals ?? {};

        const norm = {
          kpis: {
            users: toNum(k.users ?? k.userCount ?? k.usersCount ?? raw.users ?? 0),
            products: toNum(k.products ?? k.productCount ?? k.productsCount ?? raw.products ?? 0),
            orders: toNum(k.orders ?? k.orderCount ?? k.ordersCount ?? raw.orders ?? 0),
            revenueApproved: toNum(
              k.revenueApproved ?? k.revenue_sum ?? k.revenue ?? k.approvedRevenue ?? raw.revenueApproved ?? 0
            ),
            pending: toNum(k.pending ?? k.pendingCount ?? raw.pending ?? raw.pendingCount ?? 0),
          },
          salesByDay: raw.salesByDay ?? raw.sales ?? raw.sales_by_day ?? [],
          productsByCategory: raw.productsByCategory ?? raw.byCategory ?? raw.products_by_category ?? [],
          lowStock: raw.lowStock ?? raw.low_stock ?? [],
        };

        norm.salesByDay = (norm.salesByDay || []).map((d) => ({
          date: d.date ?? d.d ?? "",
          revenue: toNum(d.revenue ?? d.sum ?? d.amount ?? 0),
          orders: toNum(d.orders ?? d.count ?? 0),
        }));

        norm.productsByCategory = (norm.productsByCategory || []).map((c) => ({
          category: c.category ?? c.name ?? "ไม่ระบุ",
          count: toNum(c.count ?? c.total ?? 0),
        }));

        norm.lowStock = (norm.lowStock || []).map((p) => ({
          id: p.id,
          title: p.title ?? p.name ?? "ไม่ระบุชื่อ",
          quantity: toNum(p.quantity ?? p.qty ?? 0),
        }));

        const hasData =
          norm.kpis.users + norm.kpis.products + norm.kpis.orders + norm.kpis.revenueApproved + norm.kpis.pending > 0 ||
          (norm.salesByDay?.length || 0) > 0 ||
          (norm.productsByCategory?.length || 0) > 0;

        if (mounted && hasData) {
          setMetrics(norm);
          setLoading(false);
          return;
        }
      } catch { /* ไป fallback ต่อ */ }

      // ---------- 2) โหมดสำรอง: ใช้ endpoint ที่พี่มีอยู่แล้ว ----------
      try {
        const [usersRes, ordersRes, productsRes, slipsOkRes, slipsPendingRes] =
          await Promise.allSettled([
            axios.get(`${API}/admin/users`, { headers }),
            axios.get(`${API}/admin/orders`, { headers }),
            axios.get(`${API}/products/1000`, { headers }),
            axios.get(`${API}/admin/approve`, { headers, params: { status: "APPROVED" } }),
            axios.get(`${API}/admin/approve`, { headers, params: { status: "PENDING" } }),
          ]);

        // ดึง array ออกมาให้ได้ไม่ว่าแบ็กเอนด์จะห่อไว้ยังไง
        const usersArr     = asArray(pick(usersRes));
        const ordersArr    = asArray(pick(ordersRes));
        const productsArr  = asArray(pick(productsRes), ["products"]);
        const slipsOKArr   = asArray(pick(slipsOkRes));
        const slipsPendArr = asArray(pick(slipsPendingRes));

        const kpis = {
          users: usersArr.length,
          products: productsArr.length,
          orders: ordersArr.length,
          revenueApproved: slipsOKArr.reduce((s, x) => s + toNum(x.amount ?? x.total ?? x.sum ?? 0), 0),
          pending: slipsPendArr.length,
        };

        const salesByDay = build14DaysSeries(slipsOKArr);

        const productsByCategory = (() => {
          const m = new Map();
          for (const p of productsArr) {
            const cat =
              p?.category?.name ??
              (typeof p?.category === "string" ? p.category : undefined) ??
              p?.categoryName ??
              "ไม่ระบุ";
            m.set(cat, (m.get(cat) || 0) + 1);
          }
          return [...m.entries()].map(([category, count]) => ({ category, count }));
        })();

        const lowStock = productsArr
          .map((p) => ({
            id: p.id,
            title: p.title ?? p.name ?? "ไม่ระบุชื่อ",
            quantity: toNum(p.quantity ?? p.qty ?? 0),
          }))
          .sort((a, b) => a.quantity - b.quantity)
          .slice(0, 5);

        if (mounted) setMetrics({ kpis, salesByDay, productsByCategory, lowStock });
      } catch (err) {
        console.error("metrics fallback error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  const revenueSeries = useMemo(
    () =>
      (metrics.salesByDay || []).map((d) => ({
        date: (d.date || "").slice(5),
        revenue: toNum(d.revenue),
        orders: toNum(d.orders),
      })),
    [metrics]
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, #DDEBFF 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #FEE7F4 0%, transparent 55%), linear-gradient(180deg, #FAFAFC 0%, #F4F6F9 100%)",
      }}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl p-4 shadow animate-pulse ring-1 ring-black/5">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-6 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl p-4 shadow h-80 animate-pulse ring-1 ring-black/5" />
          <div className="rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl p-4 shadow h-80 animate-pulse ring-1 ring-black/5" />
        </div>
        <div className="rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl p-4 shadow mt-6 h-64 animate-pulse ring-1 ring-black/5" />
      </div>
    );
  }

  const { kpis, productsByCategory, lowStock } = metrics;

  return (
    <div className="min-h-screen p-6 space-y-6" style={{
      background:
        "radial-gradient(1200px 600px at 10% -10%, #DDEBFF 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #FEE7F4 0%, transparent 55%), linear-gradient(180deg, #FAFAFC 0%, #F4F6F9 100%)",
    }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">แดชบอร์ด</h1>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-gray-700 backdrop-blur ring-1 ring-black/5">
          อัปเดตเรียลไทม์จากระบบ
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Kpi icon="฿" title="ยอดขายสะสม (Approved)" value={`฿ ${fmt.format(kpis.revenueApproved)}`} />
        <Kpi icon="🧾" title="คำสั่งซื้อทั้งหมด" value={fmt.format(kpis.orders)} />
        <Kpi icon="⏳" title="รอตรวจสอบ" value={fmt.format(kpis.pending)} />
        <Kpi icon="📦" title="สินค้า" value={fmt.format(kpis.products)} />
        <Kpi icon="👤" title="ผู้ใช้" value={fmt.format(kpis.users)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales line */}
        <Card className="lg:col-span-2">
          <CardHeader title="รายได้/ออเดอร์ 14 วันล่าสุด" subtitle="อัปเดตอัตโนมัติจากระบบ" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(v, n) => (n.includes("รายได้") ? [`฿ ${fmt.format(v)}`, n] : [fmt.format(v), n])} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="รายได้ (฿)" dot={false} stroke={iosBlue} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="จำนวนออเดอร์" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Product by category */}
        <Card>
          <CardHeader title="สินค้าแยกตามหมวดหมู่" subtitle="ภาพรวมคลังสินค้า" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(v, n) => [fmt.format(v), n]} />
                <Legend />
                <Bar dataKey="count" name="จำนวนสินค้า" fill={iosBlue} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Low stock table */}
      <Card>
        <CardHeader title="สินค้าใกล้หมด (Top 5)" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b bg-white/60 backdrop-blur [&>th]:py-2 [&>th]:px-3">
                <th>ID</th>
                <th>สินค้า</th>
                <th>คงเหลือ</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-white/60 transition">
                  <td className="py-2 px-3">{p.id}</td>
                  <td className="py-2 px-3">{p.title}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-white text-xs font-medium ${
                        (p.quantity ?? 0) <= 2 ? "bg-red-500" : "bg-amber-500"
                      }`}
                    >
                      {fmt.format(p.quantity ?? 0)}
                    </span>
                  </td>
                </tr>
              ))}
              {lowStock.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-gray-500 text-center">
                    ไม่มีสินค้าใกล้หมด
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      
    </div>
  );
}

/* ---------- Reusable UI ---------- */

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 p-4 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ background: iosBlue }} />
        <h3 className="text-gray-900 font-semibold">{title}</h3>
      </div>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

function Kpi({ title, value, icon }) {
  return (
    <div className="rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-semibold mt-1 text-gray-900">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-white/80 ring-1 ring-black/5 flex items-center justify-center text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */
function toNum(v) { const n = Number(v ?? 0); return Number.isNaN(n) ? 0 : n; }

function pick(settled) {
  return settled?.status === "fulfilled" ? settled.value?.data : null;
}

// ดึง array ออกจาก payload ได้เกือบทุกรูปแบบ
function asArray(payload, preferKeys = []) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  // ถ้ามี data ซ้อน
  if (Array.isArray(payload?.data)) return payload.data;

  // ลองตามชื่อคีย์ที่พบบ่อย
  const keys = [...preferKeys, "users", "orders", "products", "items", "rows", "list", "result", "results"];
  for (const k of keys) {
    if (Array.isArray(payload?.[k])) return payload[k];
  }

  // หา array ตัวแรกใน object
  if (typeof payload === "object") {
    for (const k of Object.keys(payload)) {
      if (Array.isArray(payload[k])) return payload[k];
      if (payload[k]?.data && Array.isArray(payload[k].data)) return payload[k].data;
    }
  }
  return [];
}

function build14DaysSeries(slips = []) {
  const end = new Date(); end.setHours(23,59,59,999);
  const start = new Date(); start.setDate(end.getDate() - 13); start.setHours(0,0,0,0);

  const bucket = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0,10);
    bucket[key] = { date: key, revenue: 0, orders: 0 };
  }

  for (const s of slips) {
    const t = s.created_at || s.createdAt || s.date || s.time;
    if (!t) continue;
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0,10);
    if (!bucket[key]) continue; // กัน key นอกช่วง
    bucket[key].revenue += Number(s.amount || s.total || s.sum || 0);
    bucket[key].orders  += 1;
  }
  return Object.values(bucket).sort((a,b) => a.date.localeCompare(b.date));
}

