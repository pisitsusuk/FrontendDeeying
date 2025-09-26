// src/components/ChatBot.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useEcomStore from "../store/ecom-store";
import { getOrders } from "../api/user";
import { dateFormat } from "../utils/dateformat";
import { numberFormat } from "../utils/number";


/* ---------------- CONFIG ---------------- */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";
const API = `${API_BASE.replace(/\/$/, "")}/api`;

/* ---------------- THEME (ขาวดำแนว Apple) ---------------- */
const c = {
  bg: "#F5F5F7",
  panel: "#FFFFFF",
  text: "#0B0B0F",
  sub: "#6B7280",
  bubbleBot: "#F2F2F7",
  bubbleUser: "#000000",
  border: "rgba(0,0,0,0.08)",
  chipBorder: "rgba(0,0,0,0.15)",
};

/* ---------------- UTILS ---------------- */
const toUrl = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const base = API_BASE.replace(/\/$/, "");
  return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const formatTime = (ts) => {
  const d = ts ? new Date(ts) : new Date();
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${HH}:${mm}`;
};


// ทำให้ข้อความที่มี URL กลายเป็นลิงก์คลิกได้
const renderWithLinks = (text) => {
  const parts = String(text || "").split(/(https?:\/\/[^\s]+)/g);
  const isUrl = (s) => /^https?:\/\/[^\s]+$/.test(s);
  return parts.map((seg, i) =>
    isUrl(seg) ? (
      <a
        key={i}
        href={seg}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "underline" }}
      >
        {seg}
      </a>
    ) : (
      <React.Fragment key={i}>{seg}</React.Fragment>
    )
  );
};

/* ===================== MAIN ===================== */
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chips] = useState(["ถามราคาสินค้า", "เช็กสถานะออเดอร์", "ดูหมวดหมู่สินค้า"]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [detailLoading, setDetailLoading] = useState({});
  const [viewedIds, setViewedIds] = useState(() => new Set());
  const historyRef = useRef(null);

  // token จาก store → localStorage
  const storeToken = useEcomStore((s) => s.token);
  const token = useMemo(() => {
    const safe = (k) => {
      try {
        return JSON.parse(localStorage.getItem(k) || "null");
      } catch {
        return null;
      }
    };
    return (
      storeToken ||
      safe("ecom-store")?.state?.token ||
      safe("auth")?.token ||
      localStorage.getItem("token") ||
      ""
    );
  }, [storeToken]);

  useEffect(() => {
    // เรียกได้จากที่ไหนก็ได้: window.__openChatBot()
    window.__openChatBot = () => setOpen(true);

    // หรือ dispatch event: window.dispatchEvent(new CustomEvent('open-chat'))
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-chat", handleOpen);

    return () => {
      try { delete window.__openChatBot; } catch {}
      window.removeEventListener("open-chat", handleOpen);
    };
  }, []);

  // ===== hydrator: เติมรูป/รายละเอียดสินค้า =====
  const getFromStore = (id) => {
    const s = useEcomStore.getState();
    const pools = [s.products, s.carts, s.newProducts, s.hotProducts].filter(
      Array.isArray
    );
    for (const arr of pools) {
      const f = arr.find?.((it) => String(it.id) === String(id));
      if (f) return f;
    }
    return null;
  };
  const extractImagesFromAny = (obj) => {
    if (!obj) return [];
    const imgsArr = Array.isArray(obj.images) ? obj.images : [];
    const urls1 = imgsArr
      .map((im) => im?.url || im?.secure_url || im?.path)
      .filter(Boolean)
      .map((u) => ({ url: toUrl(u) }));
    if (urls1.length) return urls1;
    if (obj.product) return extractImagesFromAny(obj.product);
    if (obj.image) return [{ url: toUrl(obj.image) }];
    return [];
  };
  const fetchProductById = async (id) => {
    const tryGet = async (path) => {
      try {
        const r = await axios.get(`${API}${path}`);
        return r?.data?.product || r?.data?.data || r?.data || null;
      } catch {
        return null;
      }
    };
    return (
      (await tryGet(`/products/${id}`)) ||
      (await tryGet(`/product/${id}`)) ||
      null
    );
  };
  const hydrateProduct = async (p) => {
    if (!p) return p;
    const fromStore = getFromStore(p.id);
    const storeImgs = extractImagesFromAny(fromStore);
    if (fromStore && (storeImgs.length || fromStore.description)) {
      return {
        ...p,
        description: p.description ?? fromStore.description ?? "",
        images: p.images?.length ? p.images : storeImgs,
      };
    }
    const data = await fetchProductById(p.id);
    const apiImgs = extractImagesFromAny(data);
    return {
      id: data?.id ?? p.id,
      title: data?.title ?? p.title,
      price: data?.price ?? p.price,
      quantity: data?.quantity ?? p.quantity,
      description: data?.description ?? p.description ?? "",
      images: p.images?.length ? p.images : apiImgs,
    };
  };

  // categories / products (fallback)
  const categoriesStore = useEcomStore((s) => s.categories);
  const getCategory = useEcomStore((s) => s.getCategory);
  const storeProducts = useMemo(() => {
    const s = useEcomStore.getState();
    const pools = [s.hotProducts, s.newProducts, s.products].filter(Array.isArray);
    const merged = [];
    const seen = new Set();
    pools.forEach((arr) =>
      (arr || []).forEach((p) => {
        const k = String(p.id);
        if (!seen.has(k)) {
          seen.add(k);
          merged.push(p);
        }
      })
    );
    return merged;
  }, []);

useEffect(() => {
  // กันเคสที่เคยเซฟไว้ก่อนหน้า
  try {
    localStorage.removeItem("chatMessages");
    sessionStorage.removeItem("chatMessages");
  } catch {}

  // เริ่มต้นใหม่ทุกครั้งที่โหลดหน้า
  setMessages([
    {
      id: uid(),
      ts: Date.now(),
      role: "bot",
      type: "text",
      text: "ยินดีต้อนรับครับ เลือกเมนูด้านบน หรือพิมพ์คุยกับบอทได้เลย 😊",
    },
  ]);
}, []);


  // auto-scroll
  useEffect(() => {
    const el = historyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  /* ---------------- helpers ---------------- */
  const addMsg = (m) =>
    setMessages((prev) => [...prev, { id: uid(), ts: Date.now(), ...m }]);
  const getImg = (p) => {
    const arr = Array.isArray(p?.images) ? p.images : [];
    const u = arr[0]?.url || arr[0]?.secure_url || p?.image;
    return u ? toUrl(u) : null;
  };

  const commitToCart = (product, count = 1) => {
    const s = useEcomStore.getState();
    const carts = Array.isArray(s.carts) ? s.carts : [];
    const idx = carts.findIndex((it) => String(it.id) === String(product.id));
    let next;
    if (idx >= 0) next = carts.map((x, i) => (i === idx ? { ...x, count: (x.count || 1) + count } : x));
    else
      next = [
        ...carts,
        {
          id: product.id,
          title: product.title,
          price: Number(product.price) || 0,
          count,
          images: product.images || (getImg(product) ? [{ url: getImg(product) }] : []),
          description: product.description || "",
        },
      ];
    useEcomStore.setState({ carts: next });
  };

  // ===== NEW: ดึงหมวดหมู่จาก /api/category (ของพี่) =====
  const ensureCategories = async () => {
    if (categoriesStore && categoriesStore.length) return categoriesStore;
    await getCategory?.(); // ถ้า store รองรับ
    const after = useEcomStore.getState().categories;
    if (after && after.length) return after;

    // ใช้เอ็นด์พอยต์จริงของพี่
    try {
      const r = await axios.get(`${API}/category`);
      const arr = r?.data || [];
      if (arr.length) return arr;
    } catch {}

    // แตกจาก products ถ้าไม่มี endpoint
    const map = {};
    storeProducts.forEach((p) => {
      const name = p?.category?.name || p?.category || "อื่น ๆ";
      map[name] = true;
    });
    return Object.keys(map).map((name) => ({ id: name, name }));
  };

  // ===== NEW: ตัวช่วยดึง "สินค้าทั้งหมด" จากหลาย endpoint แล้วรวม =====
  const fetchAllProducts = async () => {
    const tryGet = async (path) => {
      try {
        const r = await axios.get(`${API}${path}`);
        return r?.data?.products || r?.data?.data || r?.data || [];
      } catch {
        return [];
      }
    };
    // ลองหลายทาง
    let list =
      (await tryGet(`/products`)) ||
      (await tryGet(`/products/100`)) ||
      (await tryGet(`/product`));
    if (!Array.isArray(list)) list = [];
    // ถ้าหน้าร้านมีใน store อยู่แล้ว เอามารวม (กันว่าง)
    if (!list.length) {
      const s = useEcomStore.getState();
      list = [
        ...(s.products || []),
        ...(s.hotProducts || []),
        ...(s.newProducts || []),
      ].filter(Boolean);
    }
    return list;
  };

  /* ---------------- Actions (เมนูบน) ---------------- */

  // A) ถามราคาสินค้า (ปุ่มบน = หาโชว์การ์ดจากฝั่ง client)
  const doAskPrice = () => {
    addMsg({
      role: "bot",
      type: "form",
      form: "ask_price",
      placeholder: "พิมพ์ชื่อสินค้าที่ท่านต้องการ",
    });
  };
  const runAskPrice = async (keyword) => {
    const kw = String(keyword || "").trim();
    if (!kw) return doAskPrice();
    setTyping(true);
    try {
      let list = await fetchAllProducts();
      const q = kw.toLowerCase();
      const found = list
        .filter(
          (p) =>
            String(p.title || "").toLowerCase().includes(q) ||
            String(p.description || "").toLowerCase().includes(q)
        )
        .slice(0, 8);

      if (!found.length) {
        addMsg({ role: "bot", type: "text", text: `ยังไม่พบ “${kw}” ในคลังสินค้า` });
      } else {
        addMsg({ role: "bot", type: "text", text: `นี่คือราคาของ “${kw}” ที่พบ 👇` });
        for (const p of found) {
          const hydrated = await hydrateProduct(p);
          addMsg({
            role: "bot",
            type: "product",
            product: hydrated,
            actions: [
              { type: "add_to_cart", label: "เพิ่มลงตะกร้า" },
              { type: "view_detail", label: "ดูรายละเอียด" },
            ],
          });
        }
      }
    } finally {
      setTyping(false);
    }
  };

  // B) เช็กสถานะออเดอร์
  const doOrders = async () => {
    if (!token) {
      addMsg({
        role: "bot",
        type: "text",
        text: "กรุณาเข้าสู่ระบบก่อนนะครับ จึงจะแสดงประวัติคำสั่งซื้อได้",
      });
      return;
    }
    setTyping(true);
    try {
      const r = await getOrders(token).catch(() => null);
      const list = r?.data?.orders || r?.data?.data || r?.data || [];
      if (!Array.isArray(list) || !list.length) {
        addMsg({ role: "bot", type: "text", text: "คุณยังไม่เคยสั่งซื้อสินค้า" });
      } else {
        addMsg({ role: "bot", type: "text", text: "ประวัติคำสั่งซื้อของคุณ" });
        addMsg({ role: "bot", type: "orders", orders: list });
      }
    } finally {
      setTyping(false);
    }
  };

  // C) ดูหมวดหมู่สินค้า + ให้กดเลือก
  const doCategories = async () => {
    setTyping(true);
    try {
      const cats = await ensureCategories();
      if (!cats.length)
        return addMsg({ role: "bot", type: "text", text: "ยังไม่มีหมวดหมู่ในระบบ" });

      addMsg({ role: "bot", type: "text", text: "เลือกหมวดหมู่ด้านล่างเพื่อดูสินค้า" });
      addMsg({
        role: "bot",
        type: "form",
        form: "category_picker",
        options: cats.map((c) => ({ id: c.id, name: c.name || c.title })),
      });
    } finally {
      setTyping(false);
    }
  };

  // แสดงสินค้าในหมวดเป็นรายการ (แก้ให้ดึงจริง)
  const showProductsInCategory = async (opt) => {
    const catId = opt?.id;
    const catName = opt?.name || String(catId || "");
    setTyping(true);
    try {
      let list = await fetchAllProducts();

      const byId = (p) => {
        const cid = p.categoryId ?? p.category_id ?? p.category?.id ?? null;
        return Number(cid) === Number(catId);
      };
      const byName = (p) => {
        const nm = p?.category?.name || p?.category || "";
        return String(nm).toLowerCase() === String(catName).toLowerCase();
      };

      let filtered = [];
      if (!isNaN(Number(catId))) {
        filtered = list.filter((p) => byId(p) || byName(p));
      } else {
        filtered = list.filter(byName);
      }

      // ถ้ายังว่างและ catId เป็นตัวเลข → ลองยิง /search/filters
      if (!filtered.length && !isNaN(Number(catId))) {
        try {
          const r = await axios.post(`${API}/search/filters`, {
            categoryIds: [Number(catId)],
          });
          const viaApi = Array.isArray(r?.data) ? r.data : r?.data?.products || [];
          if (viaApi.length) filtered = viaApi;
        } catch {}
      }

      if (!filtered.length) {
        addMsg({ role: "bot", type: "text", text: `ยังไม่มีสินค้าในหมวด “${catName}”` });
      } else {
        const items = filtered
          .slice(0, 30)
          .map((p, i) => `${i + 1}. ${p.title || `สินค้า #${p.id}`}`);
        addMsg({ role: "bot", type: "list", title: `สินค้าหมวด “${catName}”`, items });
      }
    } finally {
      setTyping(false);
    }
  };

  /* ---------------- Dialogflow: typewriter + ซ่อน "กำลังพิมพ์" เมื่อเริ่มพิมพ์ ---------------- */
  const typeReply = async (text) => {
    const id = uid();
    setTyping(true);
    setMessages((prev) => [
      ...prev,
      { id, ts: Date.now(), role: "bot", type: "text", text: "" },
    ]);
    for (let i = 1; i <= text.length; i++) {
      await sleep(45 + Math.floor(Math.random() * 26));
      if (i === 1) setTyping(false);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, text: text.slice(0, i) } : m))
      );
    }
  };

  /* ---------------- Input / Routing ---------------- */
  const handleSend = async (text) => {
    const msg = String(text || input || "").trim();
    if (!msg) return;
    setInput("");
    addMsg({ role: "user", type: "text", text: msg });

    if (/ออเดอร์|เช็กสถานะ|status/i.test(msg)) return doOrders();
    if (/หมวด|หมวดหมู่|category/i.test(msg)) return doCategories();

    try {
      const r = await axios.post(`${API}/chat`, { message: msg });
      const reply = r?.data?.reply || "…";
      const rich = r?.data?.rich || null;

      await typeReply(reply);

      if (rich?.type === "product_suggestion" && rich?.product) {
        const hydrated = await hydrateProduct(rich.product);
        addMsg({
          role: "bot",
          type: "product",
          product: hydrated,
          actions: [
            { type: "add_to_cart", label: "เพิ่มลงตะกร้า" },
            { type: "view_detail", label: "ดูรายละเอียด" },
          ],
        });
      }
      if (rich?.type === "product_list" && Array.isArray(rich.products)) {
        for (const p of rich.products.slice(0, 8)) {
          const hydrated = await hydrateProduct(p);
          addMsg({
            role: "bot",
            type: "product",
            product: hydrated,
            actions: [
              { type: "add_to_cart", label: "เพิ่มลงตะกร้า" },
              { type: "view_detail", label: "ดูรายละเอียด" },
            ],
          });
        }
      }
    } catch {
      setTyping(false);
      addMsg({ role: "bot", type: "text", text: "บอทล่มชั่วคราว ลองใหม่อีกทีนะครับ" });
    }
  };

  const handleChip = (label) => {
    if (label === "ถามราคาสินค้า") return doAskPrice();
    if (label === "เช็กสถานะออเดอร์") return doOrders();
    if (label === "ดูหมวดหมู่สินค้า") return doCategories();
  };

  /* ---------------- UI ---------------- */
  const Bubble = ({ side = "left", children, time, style = {} }) => (
    <div
      style={{
        display: "inline-block",
        width: "fit-content",
        maxWidth: "80%",
        backgroundColor: side === "right" ? c.bubbleUser : c.bubbleBot,
        color: side === "right" ? "#fff" : c.text,
        padding: "12px 14px",
        borderRadius: 20,
        marginLeft: side === "right" ? "auto" : 0,
        marginRight: side === "right" ? 0 : "auto",
        marginTop: 10,
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        alignSelf: side === "right" ? "flex-end" : "flex-start",
        ...style,
      }}
    >
      {children}
      {!!time && (
        <div
          style={{
            fontSize: 11,
            marginTop: 6,
            opacity: 0.7,
            textAlign: side === "right" ? "right" : "left",
            color: side === "right" ? "rgba(255,255,255,0.75)" : c.sub,
          }}
        >
          {formatTime(time)}
        </div>
      )}
    </div>
  );

  const Chip = ({ label, onClick }) => (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${c.chipBorder}`,
        background: "#fff",
        color: c.text,
        borderRadius: 999,
        padding: "6px 12px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  const ProductCard = ({ product, actions = [], variant = "suggest" }) => {
    const { id, title, price, quantity, description } = product || {};
    const imgSrc = getImg(product);

    const btn = {
      base: {
        padding: "8px 12px",
        borderRadius: 999,
        border: `1px solid ${c.border}`,
        cursor: "pointer",
        fontSize: 12.5,
      },
      primary: { background: c.text, color: "#fff" },
      ghost: { background: "#fff", color: c.text },
      disabled: { opacity: 0.5, cursor: "not-allowed" },
    };

    const detailDisabled =
      viewedIds.has(String(id)) || !!detailLoading[String(id)];

    const viewDetail = async () => {
      if (detailDisabled) return;
      setDetailLoading((m) => ({ ...m, [String(id)]: true }));
      const hydrated = await hydrateProduct(product);
      addMsg({
        role: "bot",
        type: "product",
        product: { ...hydrated },
        meta: { variant: "detail" },
      });
      setViewedIds((s) => new Set([...s, String(id)]));
      setDetailLoading((m) => {
        const { [String(id)]: _, ...rest } = m;
        return rest;
      });
    };

    return (
      <div
        style={{
          display: "flex",
          gap: 12,
          background: "#fff",
          border: `1px solid ${c.border}`,
          borderRadius: 16,
          padding: 12,
          boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
          maxWidth: 520,
          marginTop: 10,
        }}
      >
        <div
          style={{
            width: 78,
            height: 78,
            borderRadius: 12,
            overflow: "hidden",
            background: "#f3f3f3",
            flexShrink: 0,
          }}
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                color: "#aaa",
              }}
            >
              No Image
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>
            {title || `สินค้า #${id}`}
          </div>
          <div style={{ fontSize: 13, color: c.text }}>
            ราคา {numberFormat(price ?? 0)} บาท{" "}
            <span style={{ color: c.sub }}>(คงเหลือ {quantity ?? "-"} ชิ้น)</span>
          </div>
          {variant === "detail" && (
            <div
              style={{
                fontSize: 12.5,
                color: c.sub,
                marginTop: 6,
                whiteSpace: "pre-wrap",
              }}
            >
              {description || "— ไม่มีรายละเอียด —"}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {actions.map((a, i) => {
              if (a.type === "add_to_cart")
                return (
                  <button
                    key={i}
                    onClick={() => {
                      commitToCart(product, 1);
                      if (token) {
                        axios
                          .post(
                            `${API}/user/cart`,
                            { cart: [{ product: product.id, count: 1 }] },
                            { headers: { Authorization: `Bearer ${token}` } }
                          )
                          .catch(() => {});
                      }
                      toast.success("เพิ่มลงตะกร้าแล้ว");
                    }}
                    style={{ ...btn.base, ...btn.primary }}
                  >
                    {a.label || "เพิ่มลงตะกร้า"}
                  </button>
                );
              if (a.type === "view_detail")
                return (
                  <button
                    key={i}
                    onClick={viewDetail}
                    disabled={detailDisabled}
                    style={{
                      ...btn.base,
                      ...btn.ghost,
                      ...(detailDisabled ? btn.disabled : {}),
                    }}
                  >
                    {detailDisabled ? "ดูรายละเอียดแล้ว" : a.label || "ดูรายละเอียด"}
                  </button>
                );
              return null;
            })}
          </div>
        </div>
      </div>
    );
  };

  const OrdersCard = ({ orders = [] }) => (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${c.border}`,
        borderRadius: 16,
        padding: 12,
        boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
        marginTop: 10,
        maxWidth: 560,
      }}
    >
      {orders.map((o, idx) => (
        <div
          key={o.id ?? idx}
          style={{ padding: "10px 6px", borderTop: idx ? `1px dashed ${c.border}` : "none" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              alignItems: "baseline",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              ออเดอร์ #{o.id ?? "-"}
            </div>
            <div style={{ color: c.sub, fontSize: 12 }}>
              {dateFormat(o.updatedAt || o.createdAt)}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            <StatusChip label={`สลิป: ${o.slipStatus ? o.slipStatus : "—"}`} tone={getSlipTone(o.slipStatus)} />
          </div>

          {!!(o.products && o.products.length) && (
            <div style={{ marginTop: 8, border: `1px solid ${c.border}`, borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", fontSize: 12.5 }}>
                <thead style={{ background: "#FAFAFA", textAlign: "left" }}>
                  <tr>
                    <th style={{ padding: 8 }}>สินค้า</th>
                    <th style={{ padding: 8, textAlign: "right" }}>จำนวน</th>
                    <th style={{ padding: 8, textAlign: "right" }}>รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {o.products.map((p, i) => {
                    const title = p.product?.title ?? p.title ?? "-";
                    const price = Number(p.product?.price ?? p.price ?? 0);
                    const qty = Number(p.count ?? p.qty ?? p.quantity ?? 0);
                    return (
                      <tr key={i} style={{ borderTop: `1px solid ${c.border}` }}>
                        <td style={{ padding: 8 }}>{title}</td>
                        <td style={{ padding: 8, textAlign: "right" }}>{qty}</td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          {numberFormat(price * qty)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ textAlign: "right", marginTop: 6 }}>
            <div style={{ color: c.sub, fontSize: 12 }}>ยอดสุทธิ</div>
            <div style={{ fontWeight: 600 }}>{numberFormat(o.cartTotal || 0)} บาท</div>
          </div>
        </div>
      ))}
    </div>
  );

  const StatusChip = ({ label, tone = "gray" }) => {
    const tones = {
      gray: { bg: "#EFEFEF", fg: "#1F2937" },
      blue: { bg: "#E6F0FF", fg: "#1E3A8A" },
      green: { bg: "#E7F8ED", fg: "#065F46" },
      red: { bg: "#FDECEC", fg: "#991B1B" },
      amber: { bg: "#FEF6E7", fg: "#92400E" },
    };
    const t = tones[tone] || tones.gray;
    return (
      <span style={{ background: t.bg, color: t.fg, padding: "4px 8px", borderRadius: 999, fontSize: 11.5 }}>
        {label}
      </span>
    );
  };
  const getOrderTone = (st) => {
    switch (String(st || "").toLowerCase()) {
      case "processing":
        return "blue";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };
  const getSlipTone = (st) => {
    switch (String(st || "").toLowerCase()) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "pending":
      default:
        return "amber";
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="เปิดแชต"
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: c.bubbleUser,
            color: "#fff",
            border: "none",
            boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
            cursor: "pointer",
            zIndex: 9999,
            fontWeight: 600,
          }}
        >
          Chat
        </button>
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            width: 380,
            height: 600,
            background: c.panel,
            borderRadius: 24,
            border: `1px solid ${c.border}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: c.panel,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18, color: c.text }}>Chat Bot</div>
            <button
              onClick={() => setOpen(false)}
              aria-label="close"
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                border: `1px solid ${c.border}`,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              –
            </button>
          </div>

          {/* Chips */}
          <div
            style={{
              padding: "8px 10px",
              borderBottom: `1px solid ${c.border}`,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              background: "#FCFCFD",
            }}
          >
            {chips.map((label, i) => (
              <Chip key={i} label={label} onClick={() => handleChip(label)} />
            ))}
          </div>

          {/* Messages */}
          <div
            id="chat-history"
            ref={historyRef}
            style={{
              flex: 1,
              background: c.bg,
              padding: 12,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {messages.map((m) => {
              if (m.type === "text")
                return (
                  <Bubble
                    key={m.id}
                    side={m.role === "user" ? "right" : "left"}
                    time={m.ts}
                  >
                    <span style={{ fontWeight: m.role === "bot" ? 600 : 700, opacity: 0.85 }}>
                      {m.role === "user" ? "You: " : "Bot: "}
                    </span>
                    <span style={{ whiteSpace: 'pre-wrap' }}>{renderWithLinks(m.text)}</span>
                  </Bubble>
                );

              if (m.type === "product")
                return (
                  <div key={m.id} style={{ display: "flex", flexDirection: "column" }}>
                    <ProductCard
                      product={m.product}
                      actions={
                        m.actions || [
                          { type: "add_to_cart", label: "เพิ่มลงตะกร้า" },
                          { type: "view_detail", label: "ดูรายละเอียด" },
                        ]
                      }
                      variant={m?.meta?.variant || "suggest"}
                    />
                    <div style={{ fontSize: 11, color: c.sub, marginTop: 4, marginLeft: 6 }}>
                      {formatTime(m.ts)}
                    </div>
                  </div>
                );

              if (m.type === "orders")
                return (
                  <div key={m.id} style={{ display: "flex", flexDirection: "column" }}>
                    <OrdersCard orders={m.orders || []} />
                    <div style={{ fontSize: 11, color: c.sub, marginTop: 4, marginLeft: 6 }}>
                      {formatTime(m.ts)}
                    </div>
                  </div>
                );

              if (m.type === "form" && m.form === "ask_price")
                return (
                  <Bubble key={m.id} side="left" time={m.ts}>
                    <div style={{ marginBottom: 6 }}>ถามราคาสินค้า</div>
                    <SearchInline onSubmit={runAskPrice} placeholder={m.placeholder} />
                  </Bubble>
                );

              if (m.type === "form" && m.form === "category_picker")
                return (
                  <Bubble key={m.id} side="left" time={m.ts}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(m.options || []).map((opt) => (
                        <button
                          key={`${opt.id}-${opt.name}`}
                          onClick={() => showProductsInCategory(opt)}
                          style={{
                            border: "1px solid rgba(0,0,0,0.15)",
                            background: "#fff",
                            color: "#0B0B0F",
                            borderRadius: 999,
                            padding: "6px 12px",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          {opt.name}
                        </button>
                      ))}
                    </div>
                  </Bubble>
                );

              if (m.type === "list")
                return (
                  <Bubble key={m.id} side="left" time={m.ts}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{m.title}</div>
                    <ol style={{ paddingLeft: 16 }}>
                      {(m.items || []).map((t, i) => (
                        <li key={i} style={{ marginBottom: 2 }}>
                          {t}
                        </li>
                      ))}
                    </ol>
                  </Bubble>
                );

              return null;
            })}

            {typing && (
              <Bubble side="left" style={{ opacity: 0.8 }}>
                Bot กำลังพิมพ์…
              </Bubble>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: 10,
              borderTop: `1px solid ${c.border}`,
              background: c.panel,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="พิมพ์ข้อความ…"
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 999,
                border: `1px solid ${c.border}`,
                outline: "none",
                fontSize: 14,
              }}
            />
            <button
              onClick={() => handleSend()}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                background: c.text,
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ส่ง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Inline Search (สำหรับปุ่ม “ถามราคาสินค้า”) ===== */
function SearchInline({ onSubmit, placeholder = "ค้นหา…" }) {
  const [kw, setKw] = useState("");
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input
        value={kw}
        onChange={(e) => setKw(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit?.(kw)}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 12,
          padding: "8px 10px",
          fontSize: 14,
        }}
      />
      <button
        onClick={() => onSubmit?.(kw)}
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.12)",
          background: "#000",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ค้นหา
      </button>
    </div>
  );
}
