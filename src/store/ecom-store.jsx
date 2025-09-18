import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { listCategory } from "../api/Category";
import { listProduct, searchFilters as searchFiltersApi } from "../api/product";
import _ from "lodash";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";
const API = `${API_BASE.replace(/\/$/, "")}/api`;

// ---------- Auth header helper ----------
const setAuthHeader = (token) => {
  if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete axios.defaults.headers.common["Authorization"];
};

// ✅ ตั้ง header ทันทีตั้งแต่โหลดไฟล์ (ไม่ต้องรอ rehydrate)
(function bootAuthHeader() {
  try {
    const raw = localStorage.getItem("ecom-store");
    const token = raw ? JSON.parse(raw)?.state?.token : null;
    setAuthHeader(token);
  } catch {}
})();

// ---------- Store ----------
const ecomStore = (set, get) => ({
  user: null,
  token: null,
  categories: [],
  products: [],
  carts: [],

  logout: () => {
    setAuthHeader(null);
    set({ user: null, token: null, carts: [] });
    get().getCategory?.();
    get().getProduct?.();
  },

  actionAddtoCart: (product) => {
    const carts = get().carts;
    const updateCart = [...carts, { ...product, count: 1 }];
    const uniq = _.uniqBy(updateCart, (i) => i.id || i._id);
    set({ carts: uniq });
  },

  actionUpdateQuantity: (productId, newQuantity) => {
    set((state) => ({
      carts: state.carts.map((item) =>
        (item.id || item._id) === productId
          ? { ...item, count: Math.max(1, newQuantity) }
          : item
      ),
    }));
  },

  actionRemoveProduct: (productId) => {
    set((state) => ({
      carts: state.carts.filter((item) => (item.id || item._id) !== productId),
    }));
  },

  getTotalPrice: () =>
    get().carts.reduce((total, item) => total + item.price * item.count, 0),

  // ✅ หลัง login ตั้ง header ทันที + persist จะตามมาเอง
  actionLogin: async (form) => {
    const res = await axios.post(`${API}/login`, form);
    const token = res.data.token;
    setAuthHeader(token);
    set({ user: res.data.payload, token });
    return res;
  },

  getCategory: async () => {
    try {
      const res = await listCategory();
      set({ categories: res.data.items || res.data || [] });
    } catch (err) {
      console.log("getCategory error:", err);
    }
  },

  getProduct: async (count = 20) => {
    try {
      const res = await listProduct(count);
      set({ products: res.data.items || res.data || [] });
    } catch (err) {
      console.log("getProduct error:", err);
    }
  },

  // 🔎 ค้นหา/กรองสินค้า
  actionSearchFilters: async (arg = {}) => {
    try {
      const query = typeof arg.query === "string" ? arg.query.trim() : "";
      const categoryIds = Array.isArray(arg.categoryIds)
        ? arg.categoryIds.map(Number).filter(Boolean)
        : Array.isArray(arg.category)
        ? arg.category.map(Number).filter(Boolean)
        : [];

      const minPrice =
        typeof arg.minPrice === "number"
          ? arg.minPrice
          : Array.isArray(arg.price) && arg.price.length === 2
          ? Number(arg.price[0])
          : undefined;

      const maxPrice =
        typeof arg.maxPrice === "number"
          ? arg.maxPrice
          : Array.isArray(arg.price) && arg.price.length === 2
          ? Number(arg.price[1])
          : undefined;

      const noFilter =
        !query && categoryIds.length === 0 && (minPrice == null || maxPrice == null);

      if (noFilter) {
        await get().getProduct();
        return;
      }

      const payload = {};
      if (query) payload.query = query;
      if (categoryIds.length) {
        payload.categoryIds = categoryIds;
        payload.category = categoryIds; // เผื่อ backend เก่า
      }
      if (minPrice != null) payload.minPrice = minPrice;
      if (maxPrice != null) payload.maxPrice = maxPrice;
      if (minPrice != null && maxPrice != null) payload.price = [minPrice, maxPrice];

      const res = await searchFiltersApi(payload);
      const data = res?.data?.items ?? res?.data?.products ?? res?.data ?? [];
      set({ products: Array.isArray(data) ? data : [] });
    } catch (err) {
      console.log("actionSearchFilters error:", err);
    }
  },

  clearCart: () => set({ carts: [] }),
});

// ---------- Persist ----------
const usePersist = {
  name: "ecom-store",
  storage: createJSONStorage(() => localStorage),
  // ไม่ต้อง setTimeout แล้ว ตั้ง header ไปตั้งแต่ boot แล้ว
  onRehydrateStorage: () => () => {
    try {
      const raw = localStorage.getItem("ecom-store");
      const token = raw ? JSON.parse(raw)?.state?.token : null;
      setAuthHeader(token);
    } catch {}
  },
};

const useEcomStore = create(persist(ecomStore, usePersist));
export default useEcomStore;
