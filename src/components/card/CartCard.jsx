// src/components/card/CartCard.jsx
import React from "react";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import useEcomStore from "../../store/ecom-store";
import { numberFormat } from "../../utils/number";

const CartCard = () => {
  const carts = useEcomStore((s) => s.carts) || [];
  const updateQty = useEcomStore((s) => s.actionUpdateQuantity);
  const removeItem = useEcomStore((s) => s.actionRemoveProduct);
  const getTotalPrice = useEcomStore((s) => s.getTotalPrice);

  const imgOf = (item) => {
    const u =
      item?.images?.[0]?.url ||
      item?.images?.[0]?.secure_url ||
      item?.image ||
      "";
    return u || "";
  };

  const dec = (item) => {
    const next = Number(item.count || 1) - 1;
    if (next <= 0) removeItem(item.id);
    else updateQty(item.id, next);
  };

  const inc = (item) => {
    const next = Number(item.count || 1) + 1;
    updateQty(item.id, next);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-gray-900">ตะกร้าสินค้า</h2>
        <span className="px-2 py-0.5 text-xs rounded-full bg-white/80 ring-1 ring-black/5">
          {carts.length} รายการ
        </span>
      </div>

      <div className="rounded-[18px] border border-white/40 bg-white/80 backdrop-blur-xl ring-1 ring-black/5 shadow-[0_8px_24px_rgba(0,0,0,0.06)] p-3">
        {/* Empty state */}
        {carts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 gap-3">
            <div className="w-12 h-12 rounded-2xl grid place-items-center bg-gray-100">
              <ShoppingBag className="text-gray-500" size={22} />
            </div>
            <div className="text-sm text-gray-600">ยังไม่มีสินค้าในตะกร้า</div>
            <Link
              to="/shop"
              className="text-xs px-3 py-1.5 rounded-full bg-black text-white hover:opacity-90 transition"
            >
              ไปเลือกซื้อสินค้า
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
              {carts.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="rounded-[14px] border border-white/50 bg-white shadow-sm p-2"
                >
                  {/* Row 1: image + title + delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-black/5">
                        {imgOf(item) ? (
                          <img
                            src={imgOf(item)}
                            alt={item.title || "product"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-[11px] text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.title || `สินค้า #${item.id}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          ราคา {numberFormat(item.price || 0)} บาท
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600/90 hover:bg-red-50 rounded-lg transition"
                      title="ลบสินค้า"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Row 2: qty + line total */}
                  <div className="mt-2 flex items-center justify-between">
                    {/* Qty control */}
                    <div className="flex items-center rounded-full border border-gray-200 bg-white overflow-hidden">
                      <button
                        onClick={() => dec(item)}
                        className="px-2 py-1 hover:bg-gray-100 transition"
                        aria-label="decrease"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 text-sm min-w-[28px] text-center">
                        {item.count}
                      </span>
                      <button
                        onClick={() => inc(item)}
                        className="px-2 py-1 hover:bg-gray-100 transition"
                        aria-label="increase"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-[15px] font-semibold text-gray-900">
                      {numberFormat((item.price || 0) * (item.count || 0))}฿
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-3 pt-3 border-t border-gray-200/70">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">รวม</span>
                <span className="font-semibold text-gray-900">
                  {numberFormat(getTotalPrice())} บาท
                </span>
              </div>

              <Link to="/cart">
                <button className="mt-3 w-full rounded-2xl bg-black text-white py-2.5 text-sm font-semibold shadow hover:opacity-90 transition">
                  ดำเนินการชำระเงิน
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartCard;
