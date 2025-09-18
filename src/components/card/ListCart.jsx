// client/src/components/card/ListCart.jsx
import React from "react";
import { ListCheck, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";
import { createUserCart } from "../../api/user";
import { numberFormat } from "../../utils/number";

const getThumb = (item) => {
  const arr = Array.isArray(item?.images) ? item.images : [];
  const u = arr[0]?.url || arr[0]?.secure_url || arr[0]?.path || item?.image;
  return u || "/noimg.png";
};

export default function ListCart() {
  const cart = useEcomStore((s) => s.carts);
  const user = useEcomStore((s) => s.user);
  const token = useEcomStore((s) => s.token);
  const getTotalPrice = useEcomStore((s) => s.getTotalPrice);

  const navigate = useNavigate();
  const total = getTotalPrice();
  const isEmpty = !cart || cart.length === 0;

  const handleSaveCart = async () => {
    if (!token) {
      toast.info("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ");
      return;
    }
    try {
      await createUserCart(token, { cart });
      toast.success("บันทึกตะกร้าเรียบร้อยแล้ว", { position: "top-center" });
      navigate("/checkout");
    } catch (err) {
      const msg = err?.response?.data?.message || "บันทึกตะกร้าไม่สำเร็จ";
      toast.warning(msg);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="inline-grid h-10 w-10 place-items-center rounded-2xl bg-black text-white">
          <ListCheck size={20} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">
            รายการสินค้า{" "}
            <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-700">
              {cart.length} รายการ
            </span>
          </h1>
          <p className="text-sm text-gray-500">สรุปและยืนยันคำสั่งซื้อของคุณ</p>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <div className="rounded-3xl border border-black/10 bg-white/90 p-10 text-center shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
          <div className="mx-auto mb-3 inline-grid h-14 w-14 place-items-center rounded-2xl bg-gray-900 text-white">
            <ShoppingCart size={22} />
          </div>
          <div className="text-lg font-semibold text-gray-900">ยังไม่มีสินค้าในตะกร้า</div>
          <div className="mt-1 text-sm text-gray-500">เลือกสินค้าที่คุณต้องการจากหน้าร้านค้าได้เลย</div>
          <Link
            to="/shop"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98]"
          >
            ไปที่หน้าร้านค้า
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left : รายการสินค้า */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-black/10 bg-white/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              {cart.map((item, idx) => (
                <div
                  key={(item.id ?? item._id ?? idx) + "-cart"}
                  className="flex items-center justify-between gap-3 border-b border-black/5 py-3 last:border-0"
                >
                  {/* left: image + title */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
                      <div className="h-16 w-16">
                        <img
                          src={getThumb(item)}
                          alt={item.title}
                          className="h-full w-full object-contain p-1.5"
                          loading="lazy"
                          onError={(e) => (e.currentTarget.src = "/noimg.png")}
                        />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        ฿{numberFormat(item.price)} × {item.count}
                      </div>
                    </div>
                  </div>

                  {/* right: amount */}
                  <div className="whitespace-nowrap text-right">
                    <div className="text-[15px] font-semibold text-gray-900">
                      ฿{numberFormat(item.price * item.count)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right : สรุปคำสั่งซื้อ */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-3xl border border-black/10 bg-white/90 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              <div className="mb-3 text-lg font-semibold text-gray-900">ยอดรวม</div>

              <div className="space-y-2 text-sm">
                <Row label="รวมสินค้า" value={`฿${numberFormat(total)}`} />
                <Row label="ค่าจัดส่ง" value="—" />
                <div className="my-2 border-t border-black/10" />
                <Row
                  label={<span className="font-semibold text-gray-900">รวมสุทธิ</span>}
                  value={<span className="text-xl font-bold text-gray-900">฿{numberFormat(total)}</span>}
                />
              </div>

              <div className="mt-5 flex flex-col gap-2">
                {user ? (
                  <button
                    onClick={handleSaveCart}
                    disabled={isEmpty}
                    className={[
                      "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98]",
                      isEmpty ? "cursor-not-allowed bg-gray-300 text-white" : "bg-black text-white hover:opacity-90",
                    ].join(" ")}
                  >
                    <ShoppingCart size={18} />
                    สั่งซื้อ
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98]"
                  >
                    เข้าสู่ระบบเพื่อชำระเงิน
                  </Link>
                )}
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 active:scale-[0.98]"
                >
                  แก้ไขรายการ
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-gray-600">{label}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}
