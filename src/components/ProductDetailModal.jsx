// client/src/components/ProductDetailModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import useEcomStore from "../store/ecom-store";
import { numberFormat } from "../utils/number";

const normalizeImages = (product) => {
  if (!product) return [];
  const arr = Array.isArray(product.images) ? product.images : [];
  const urls = arr
    .map((im) => im?.secure_url || im?.url || im?.path || im?.src)
    .filter(Boolean);
  if (urls.length) return urls;
  if (product?.image) return [product.image];
  return [];
};

const ProductDetailModal = ({ open, product, onClose }) => {
  const addToCart = useEcomStore((s) => s.actionAddtoCart);
  const categories = useEcomStore((s) => s.categories) || [];
  const getCategory = useEcomStore((s) => s.getCategory);

  // โหลดหมวดหมู่ + ล็อกสกอร์ลเมื่อเปิดโมดัล
  useEffect(() => {
    if (!categories?.length) getCategory?.();

    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open, categories?.length, getCategory]);

  // ปิดด้วย ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const imgs = useMemo(() => normalizeImages(product), [product]);
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => setActiveIdx(0), [open, product]);

  const categoryName = useMemo(() => {
    if (!product) return "-";
    if (product?.category?.name) return product.category.name;
    if (product?.categoryName) return product.categoryName;
    const id = product?.categoryId || product?.category?.id;
    const found = categories.find((c) => Number(c.id) === Number(id));
    return found?.name || "-";
  }, [product, categories]);

  const price = Number(product?.price || 0);
  const stock = Number(product?.quantity ?? 0);
  const outOfStock = stock <= 0;

  const cover =
    imgs[activeIdx] ||
    product?.images?.[0]?.secure_url ||
    product?.images?.[0]?.url ||
    "/noimg.png";

  // โมดัลจริง (AnimatePresence จัดการ mount/unmount)
  const modal = (
    <AnimatePresence>
      {open && product && (
        <motion.div
          className="fixed inset-0 z-[9999] flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-[1] mx-auto my-auto w-[min(96vw,980px)]"
            initial={{ y: 24, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div
              className={[
                "rounded-3xl bg-white/90 backdrop-blur-xl",
                "ring-1 ring-black/5 shadow-[0_24px_80px_rgba(0,0,0,0.20)]",
                "overflow-hidden",
              ].join(" ")}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/5">
                <div className="min-w-0">
                  <div className="text-[18px] font-semibold text-gray-900 truncate">
                    {product.title}
                  </div>
                  <div className="text-[12.5px] text-gray-500">
                    หมวดหมู่: {categoryName}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="ปิด"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-black/10 bg-white hover:bg-gray-50 active:scale-[0.98] transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="grid md:grid-cols-2 gap-0">
                {/* ภาพสินค้า */}
                <div className="p-5 md:p-6">
                  <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden">
                    <div className="w-full" style={{ aspectRatio: "4 / 3" }}>
                      <img
                        src={cover}
                        alt={product.title}
                        className="w-full h-full object-contain p-4"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.src = "/noimg.png")}
                      />
                    </div>
                  </div>

                  {/* แกลเลอรีรูปเล็ก */}
                  {imgs.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {imgs.map((u, i) => (
                        <button
                          key={u + i}
                          onClick={() => setActiveIdx(i)}
                          className={[
                            "shrink-0 rounded-xl ring-1 ring-black/5 bg-white",
                            i === activeIdx
                              ? "outline outline-2 outline-gray-900/70"
                              : "opacity-80 hover:opacity-100",
                          ].join(" ")}
                          style={{ width: 64, height: 64 }}
                          title={`รูปที่ ${i + 1}`}
                        >
                          <img
                            src={u}
                            alt={`thumb-${i + 1}`}
                            className="w-full h-full object-contain p-1.5"
                            onError={(e) => (e.currentTarget.style.opacity = 0.3)}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* รายละเอียด */}
                <div className="p-5 md:p-6 border-t md:border-t-0 md:border-l border-black/5">
                  {/* ราคา & สต็อก */}
                  <div className="flex items-end justify-between gap-3">
                    <div className="text-3xl font-bold text-gray-900">
                      ฿ {numberFormat(price)}
                    </div>
                    <span
                      className={[
                        "text-[12px] px-2.5 py-1 rounded-full",
                        outOfStock
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-800",
                      ].join(" ")}
                    >
                      {outOfStock ? "สินค้าหมด" : `คงเหลือ ${stock} ชิ้น`}
                    </span>
                  </div>

                  {/* คำอธิบาย */}
                  <div className="mt-4 max-h-[38vh] overflow-auto">
                    <div className="prose prose-sm max-w-none text-gray-800">
                      {product.description?.trim()
                        ? product.description
                        : "ไม่มีรายละเอียดสินค้า"}
                    </div>
                  </div>

                  {/* ปุ่ม */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => !outOfStock && addToCart(product)}
                      disabled={outOfStock}
                      className={[
                        "inline-flex items-center gap-2 px-4 py-2.5 rounded-full",
                        "text-white active:scale-[0.98] transition",
                        outOfStock
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-black hover:opacity-90",
                      ].join(" ")}
                    >
                      <ShoppingCart size={18} />
                      <span className="text-[13.5px] font-semibold">
                        {outOfStock ? "สินค้าหมด" : "หยิบลงตะกร้า"}
                      </span>
                    </button>
                    <button
                      onClick={onClose}
                      className="inline-flex items-center px-4 py-2.5 rounded-full border border-black/10 bg-white hover:bg-gray-50 active:scale-[0.98] transition text-[13.5px] font-medium"
                    >
                      ปิดหน้าต่าง
                    </button>
                  </div>

                  {/* meta เล็ก ๆ */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] text-gray-500">
                    <div>
                      <span className="text-gray-400">รหัสสินค้า:</span>{" "}
                      <span className="text-gray-700">
                        {product.id ?? product._id ?? "-"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400">หมวดหมู่:</span>{" "}
                      <span className="text-gray-700">{categoryName}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Body */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ✅ แปะโมดัลไว้ที่ <body> เพื่อไม่ติด transform ของ Swiper/การ์ด
  return createPortal(modal, document.body);
};

export default ProductDetailModal;
