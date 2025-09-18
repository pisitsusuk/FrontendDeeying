import React, { useState } from "react";
import { numberFormat } from "../../utils/number";
import useEcomStore from "../../store/ecom-store";
import { ShoppingCart, Info } from "lucide-react";
import ProductDetailModal from "../ProductDetailModal";

export default function AppleAccessoryCard({ item }) {
  const addToCart = useEcomStore((s) => s.actionAddtoCart);

  const title = item?.product?.title ?? item?.title ?? "-";
  const price = Number(item?.product?.price ?? item?.price ?? 0);
  const img =
    item?.images?.[0]?.secure_url ||
    item?.images?.[0]?.url ||
    item?.image ||
    item?.thumbnail ||
    item?.product?.images?.[0]?.secure_url ||
    item?.product?.images?.[0]?.url ||
    "";

  // ใช้ object ที่ field ครบสุดสำหรับโมดัล
  const productForModal = item?.product ?? item;

  const [openDetail, setOpenDetail] = useState(false);

  return (
    <>
      <div className="apple-card">
        {/* รูปสินค้าเท่ากันทุกใบ */}
        <div className="apple-imgbox">
          {img ? (
            <img
              src={img}
              alt={title}
              className="max-h-[78%] max-w-[78%] object-contain select-none pointer-events-none"
              loading="lazy"
              onError={(e) => (e.currentTarget.src = "/noimg.png")}
            />
          ) : (
            <div className="h-full w-full bg-[#fafafa]" />
          )}
        </div>

        {/* เนื้อหา + ปุ่มด้านล่างขวา */}
        <div className="apple-card-body">
          <div className="apple-card-title">{title}</div>

          <div className="mt-2 flex items-center justify-between">
            <div className="apple-card-price">฿{numberFormat(price)}</div>

            <div className="apple-act">
              <button
                className="apple-act-btn"
                aria-label="เพิ่มลงตะกร้า"
                title="เพิ่มลงตะกร้า"
                onClick={() =>
                  addToCart({ ...(item?.product || item), count: 1 })
                }
              >
                <ShoppingCart size={18} />
              </button>

              <button
                className="apple-act-btn"
                aria-label="ดูรายละเอียด"
                title="ดูรายละเอียด"
                onClick={() => setOpenDetail(true)}
              >
                <Info size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* โมดัลรายละเอียดสินค้า */}
      <ProductDetailModal
        open={openDetail}
        product={productForModal}
        onClose={() => setOpenDetail(false)}
      />
    </>
  );
}
