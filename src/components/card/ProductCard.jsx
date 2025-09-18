import React from "react";
import { ShoppingCart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import useEcomStore from "../../store/ecom-store";
import { numberFormat } from "../../utils/number";

const ProductCard = ({ item, onOpenDetail }) => {
  const addToCart = useEcomStore((s) => s.actionAddtoCart);

  const imgSrc =
    item?.images?.[0]?.url ||
    item?.images?.[0]?.secure_url ||
    item?.image ||
    "";

  const outOfStock = Number(item?.quantity ?? 0) <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className="group w-full"
    >
      <div
        className={[
          "w-full rounded-2xl border border-white/40 bg-white/85",
          "backdrop-blur-xl ring-1 ring-black/5",
          "shadow-[0_12px_30px_rgba(0,0,0,0.06)]",
          "hover:shadow-[0_16px_42px_rgba(0,0,0,0.10)]",
          "transition-all duration-200 ease-out",
          "p-4",
        ].join(" ")}
      >
        {/* รูปสินค้า: ใช้ object-contain กันโดนตัดหัว */}
        <div
          className="relative overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
          style={{ aspectRatio: "4 / 3" }} // กรอบ 4:3 ให้สม่ำเสมอ
        >
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={item?.title || "product"}
              loading="lazy"
              className="w-full h-full object-contain p-3" // ★ เปลี่ยนเป็น contain + padding
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-[12px] text-gray-400">
              No Image
            </div>
          )}

          {outOfStock && (
            <div className="absolute left-2 top-2 text-[11px] px-2 py-1 rounded-full bg-gray-900/85 text-white backdrop-blur">
              สินค้าหมด
            </div>
          )}
        </div>

        {/* Title + ราคา */}
        <div className="mt-3 space-y-1.5">
          <div className="text-[16px] font-semibold text-gray-900 leading-snug truncate">
            {item?.title || `สินค้า #${item?.id}`}
          </div>
          <div className="text-[13px] text-gray-600">
            {outOfStock ? (
              <span className="text-gray-500">—</span>
            ) : (
              <>฿ {numberFormat(item?.price || 0)}</>
            )}{" "}
            <span className="text-gray-400">• คงเหลือ {Number(item?.quantity ?? 0) || 0}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => onOpenDetail?.(item)}
            title="ดูรายละเอียด"
            aria-label="ดูรายละเอียด"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 active:scale-[0.98] transition"
          >
            <Eye size={16} />
            <span className="text-[12.5px] font-medium">รายละเอียด</span>
          </button>

          <button
            onClick={() => !outOfStock && addToCart(item)}
            title={outOfStock ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
            aria-label="เพิ่มลงตะกร้า"
            disabled={outOfStock}
            className={[
              "flex items-center gap-1.5 px-3 py-2 rounded-full text-white transition active:scale-[0.98]",
              outOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:opacity-90",
            ].join(" ")}
          >
            <ShoppingCart size={16} />
            <span className="text-[12.5px] font-semibold">
              {outOfStock ? "หมด" : "เพิ่มลงตะกร้า"}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
