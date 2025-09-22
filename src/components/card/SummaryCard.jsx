import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";
import { listUserCart, saveAddress } from "../../api/user";
import { numberFormat } from "../../utils/number";

/* ---------- CONFIG & HELPERS ---------- */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";

const toUrl = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const base = API_BASE.replace(/\/$/, "");
  return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
};

const getCoverFromObj = (obj) => {
  if (!obj) return "";
  const imgs = Array.isArray(obj.images) ? obj.images : [];
  const u =
    imgs[0]?.url ||
    imgs[0]?.secure_url ||
    imgs[0]?.path ||
    obj.image ||
    obj.cover ||
    obj.thumbnail ||
    "";
  return u ? toUrl(u) : "";
};

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <div className="text-gray-600">{label}</div>
    <div className="text-gray-900">{value}</div>
  </div>
);

/* ---------- NEW: localStorage key for last saved address ---------- */
const LS_KEY_LAST_ADDR = "last_address_checkout";

export default function SummaryCard() {
  const token = useEcomStore((s) => s.token);

  // ใช้ pools สินค้าใน store เพื่อเติมรูป
  const s = useEcomStore.getState();
  const products = useEcomStore((st) => st.products);
  const getProduct = useEcomStore((st) => st.getProduct);
  const productIndex = useMemo(() => {
    const pools = [s.products, s.hotProducts, s.newProducts].filter(Array.isArray);
    const idx = new Map();
    pools.forEach((arr) => (arr || []).forEach((p) => idx.set(String(p.id ?? p._id), p)));
    return idx;
  }, [products]); // อัปเดตเมื่อ products เปลี่ยน

  const [items, setItems] = useState([]); // [{ product, count }]
  const [cartTotal, setCartTotal] = useState(0);
  const [cartId, setCartId] = useState(null);

  const [address, setAddress] = useState("");
  const [addressSaved, setAddressSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------- NEW: previous address state + checkbox ---------- */
  const [prevAddress, setPrevAddress] = useState("");
  const [usePrev, setUsePrev] = useState(false);

  const navigate = useNavigate();

useEffect(() => {
  if (!Array.isArray(products) || products.length === 0) {
    getProduct?.();
  }
  // ไม่มีการ setAddress ที่นี่อีกต่อไป
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  // โหลดตะกร้า
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const res = await listUserCart(token);
        const list = res?.data?.products || [];
        setItems(list);
        setCartTotal(res?.data?.cartTotal || 0);
        const cid =
          res?.data?.cartId ??
          res?.data?.id ??
          (Array.isArray(list) && list[0]?.cartId) ??
          null;
        setCartId(cid);
      } catch (err) {
        console.log(err);
        toast.error("โหลดข้อมูลตะกร้าไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // โหลด “ที่อยู่ก่อนหน้า” จาก history → ถ้าไม่เจอให้ลองจาก localStorage
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/user/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let found = "";
        if (r.ok) {
          const data = await r.json();
          const orders = Array.isArray(data?.orders) ? data.orders : [];
          for (const o of orders) {
            const a = (o?.shippingAddress || o?.address || o?.shipping_address || "").trim();
            if (a) { found = a; break; }
          }
        }
        const fromLS = localStorage.getItem(LS_KEY_LAST_ADDR) || "";
        setPrevAddress(found || fromLS || "");
      } catch {
        const fromLS = localStorage.getItem(LS_KEY_LAST_ADDR) || "";
        setPrevAddress(fromLS || "");
      }
    })();
  }, [token]);

  // หา URL รูป
  const resolveCover = (p) => {
    const own = getCoverFromObj(p);
    if (own) return own;
    const id = p?.id ?? p?._id;
    if (!id) return "/noimg.png";
    const fromStore = productIndex.get(String(id));
    const url = getCoverFromObj(fromStore);
    return url || "/noimg.png";
  };

  const canCheckout = useMemo(
    () => !!cartId && !!addressSaved && items.length > 0,
    [cartId, addressSaved, items.length]
  );

  const hdlSaveAddress = async () => {
    const addr = (address || "").trim();
    if (!addr) return toast.warning("กรุณากรอกที่อยู่ให้ครบถ้วน");
    if (!cartId) return toast.error("ไม่พบ Cart ID");

    try {
      setSaving(true);
      const res = await saveAddress(token, { address: addr, cartId });
      toast.success(res?.data?.message || "บันทึกที่อยู่เรียบร้อย");
      setAddressSaved(true);
      /* ---------- NEW: จำไว้ใน localStorage + อัปเดต prev ---------- */
      localStorage.setItem(LS_KEY_LAST_ADDR, addr);
      setPrevAddress(addr);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "บันทึกที่อยู่ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- NEW: toggle ใช้ที่อยู่ก่อนหน้า ---------- */
  const hdlToggleUsePrev = () => {
    const next = !usePrev;
    setUsePrev(next);
    if (!next) return;
    const pick = (prevAddress || "").trim() || localStorage.getItem(LS_KEY_LAST_ADDR) || "";
    if (pick) {
      setAddress(pick);
      setAddressSaved(false); // ให้กดบันทึกใหม่เพื่อยืนยัน
    } else {
      toast.info("ยังไม่พบที่อยู่จากคำสั่งซื้อก่อนหน้า");
      setUsePrev(false);
    }
  };

  const hdlGoToPayment = () => {
    if (!addressSaved)
      return toast.warning("กรุณากด “บันทึกที่อยู่” ก่อนดำเนินการชำระเงิน");
    if (!cartId) return toast.error("ไม่พบ Cart ID กรุณารีเฟรชหน้า");
    localStorage.setItem("pay_total", String(cartTotal));
    navigate(`/user/payment-slip?cart_id=${cartId}&amount=${cartTotal}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-5 text-2xl font-semibold text-gray-900">สรุปคำสั่งซื้อ</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: Address + Summary */}
        <aside className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            <div className="mb-3 text-lg font-semibold text-gray-900">
              ที่อยู่ในการจัดส่ง
            </div>

            {/* NEW: ใช้ที่อยู่ก่อนหน้า */}
            <label className="mb-2 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={usePrev}
                onChange={hdlToggleUsePrev}
                className="h-4 w-4 rounded border-gray-300"
              />
              ใช้ที่อยู่จากคำสั่งซื้อครั้งก่อน
              {prevAddress ? (
                <span className="truncate text-gray-500 max-w-[14rem]">— {prevAddress}</span>
              ) : null}
            </label>

            <textarea
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (addressSaved) setAddressSaved(false);
              }}
              placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์, เบอร์โทร"
              className="h-32 w-full resize-y rounded-2xl border border-black/10 bg-white p-3 text-[15px] outline-none placeholder:text-gray-400"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {addressSaved ? (
                  <span className="text-green-700">✓ บันทึกแล้ว</span>
                ) : (
                  "กรุณาบันทึกที่อยู่ก่อนชำระเงิน"
                )}
              </div>
              <button
                onClick={hdlSaveAddress}
                disabled={saving || !address.trim()}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98]",
                  saving || !address.trim()
                    ? "cursor-not-allowed border border-black/10 bg-gray-200 text-gray-500"
                    : "bg-black text-white hover:opacity-90",
                ].join(" ")}
              >
                {saving ? "กำลังบันทึก…" : addressSaved ? "บันทึกอีกครั้ง" : "บันทึกที่อยู่"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/90 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            <div className="mb-3 text-lg font-semibold text-gray-900">ยอดรวม</div>
            <div className="space-y-2 text-sm">
              <Row label="รวมสินค้า" value={`฿${numberFormat(cartTotal)}`} />
              <div className="my-2 border-t border-black/10" />
              <Row
                label={<span className="font-semibold text-gray-900">รวมสุทธิ</span>}
                value={<span className="text-xl font-bold text-gray-900">฿{numberFormat(cartTotal)}</span>}
              />
            </div>

            <button
              onClick={hdlGoToPayment}
              disabled={!canCheckout}
              className={[
                "mt-5 w-full rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98]",
                canCheckout ? "bg-black text-white hover:opacity-90" : "cursor-not-allowed bg-gray-300 text-white",
              ].join(" ")}
            >
              ดำเนินการชำระเงิน
            </button>

            {cartId && (
              <div className="mt-2 text-xs text-gray-500">
                Cart ID: <b>{cartId}</b>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT: Items */}
        <section className="lg:col-span-2">
          <div className="rounded-3xl border border-black/10 bg-white/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 rounded-2xl bg-gray-100" />
                <div className="h-16 rounded-2xl bg-gray-100" />
                <div className="h-16 rounded-2xl bg-gray-100" />
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                ยังไม่มีสินค้าในคำสั่งซื้อ
              </div>
            ) : (
              items.map((it, idx) => {
                const p = it.product || {};
                const qty = Number(it.count || 0);
                const price = Number(p.price || 0);
                const cover = resolveCover(p);

                return (
                  <div
                    key={(p.id ?? p._id ?? idx) + "-sum"}
                    className="mb-3 flex items-center justify-between gap-3 rounded-3xl bg-white/70 p-3 ring-1 ring-black/5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
                        <div className="h-16 w-16">
                          <img
                            src={cover}
                            alt={p.title}
                            className="h-full w-full object-contain p-1.5"
                            loading="lazy"
                            onError={(e) => (e.currentTarget.src = "/noimg.png")}
                          />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-semibold text-gray-900">
                          {p.title || `สินค้า #${p.id ?? p._id ?? ""}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          จำนวน: {qty} × ฿{numberFormat(price)}
                        </div>
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-[15px] font-semibold text-gray-900">
                      ฿{numberFormat(qty * price)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
