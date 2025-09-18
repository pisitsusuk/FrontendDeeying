// src/pages/Shop.jsx
import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/card/ProductCard";
import useEcomStore from "../store/ecom-store";
import SearchCard from "../components/card/SearchCard";
import CartCard from "../components/card/CartCard";
import ProductDetailModal from "../components/ProductDetailModal";

const iosBg =
  "radial-gradient(1200px 600px at 10% -10%, #EDEEF1 0%, transparent 60%), " +
  "radial-gradient(900px 500px at 100% 0%, #F4F4F6 0%, transparent 55%), " +
  "linear-gradient(180deg, #FAFAFC 0%, #F5F6F8 100%)";

export default function Shop() {
  const products   = useEcomStore((s) => s.products) || [];
  const getProduct = useEcomStore((s) => s.getProduct);
  const getCategory= useEcomStore((s) => s.getCategory);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState("latest"); // latest | price_asc | price_desc | name

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([getCategory?.(), getProduct?.()]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDetail = (item) => {
    setSelected(item);
    setOpen(true);
  };

  const sorted = useMemo(() => {
    const arr = [...products];
    switch (sort) {
      case "price_asc":
        return arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case "price_desc":
        return arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      case "name":
        return arr.sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "th"));
      case "latest":
      default:
        // ถ้ามี createdAt ให้ sort ใหม่สุดก่อน
        return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  }, [products, sort]);

  return (
    <div
      className="min-h-screen"
      style={{ background: iosBg }}
    >
      {/* Top header */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-3">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">ร้านค้า</h1>
            
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            สินค้าทั้งหมด
            <span className="inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-white/80 ring-1 ring-black/5 px-2">
              {products.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="mx-auto max-w-7xl px-4 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Filters */}
        <aside className="lg:col-span-3">
          <div className="sticky top-4 rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4">
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-black/70" />
                <h3 className="text-gray-900 font-semibold">ค้นหา & ตัวกรอง</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">ปรับแต่งเพื่อหาสินค้าที่ใช่</p>
            </div>
            <SearchCard />
          </div>
        </aside>

        {/* Middle: Products */}
        <main className="lg:col-span-6">
          {/* Toolbar */}
          <div className="rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm text-gray-700">
                {loading
                  ? "กำลังโหลดสินค้า…"
                  : `พบ ${sorted.length} รายการ`}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">เรียงโดย</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm rounded-xl border border-gray-200 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="latest">มาใหม่ก่อน</option>
                  <option value="price_asc">ราคาต่ำ-สูง</option>
                  <option value="price_desc">ราคาสูง-ต่ำ</option>
                  <option value="name">ชื่อสินค้า (ก-ฮ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl ring-1 ring-black/5 shadow animate-pulse"
                />
              ))
            ) : sorted.length === 0 ? (
              <div className="col-span-full text-gray-500 text-center py-10">
                ไม่พบสินค้า
              </div>
            ) : (
              sorted.map((item, index) => (
                <div
                  key={item._id || item.id || index}
                  className="rounded-[22px] border border-white/30 bg-white/80 backdrop-blur-xl ring-1 ring-black/5 shadow hover:shadow-lg transition"
                >
                  {/* ใช้การ์ดเดิม แต่ห่อด้วยกลาสให้เนียนกับธีม */}
                  <ProductCard
                    item={item}
                    onOpenDetail={() => handleOpenDetail(item)}
                  />
                </div>
              ))
            )}
          </div>
        </main>

        {/* Right: Cart */}
        <aside className="lg:col-span-3">
          <div className="sticky top-4 rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4">
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-black/70" />
                <h3 className="text-gray-900 font-semibold">ตะกร้าของคุณ</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">อัปเดตแบบเรียลไทม์</p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <CartCard />
            </div>
          </div>
        </aside>
      </div>

      {/* Modal รายละเอียดสินค้า */}
      <ProductDetailModal
        open={open}
        product={selected}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
