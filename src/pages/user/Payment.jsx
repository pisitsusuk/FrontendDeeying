import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { payment } from "../../api/stripe";
import useEcomStore from "../../store/ecom-store";
import CheckoutForm from "../../components/CheckoutForm";

// โหลด Stripe แค่ครั้งเดียว
const STRIPE_PK = import.meta.env.VITE_STRIPE_PK;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

export default function Payment() {
  const token = useEcomStore((s) => s.token);

  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    // ยังไม่มี token ก็ยังไม่ต้องยิง
    if (!token) return;

    let alive = true;
    setLoading(true);
    setErrMsg("");

    payment(token)
      .then((res) => {
        const cs = res?.data?.clientSecret;
        if (!alive) return;
        if (!cs) {
          setErrMsg("ไม่พบ clientSecret จากเซิร์ฟเวอร์");
          return;
        }
        setClientSecret(cs);
      })
      .catch((err) => {
        if (!alive) return;
        console.error("create payment intent error:", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "สร้างคำสั่งชำระเงินไม่สำเร็จ";
        setErrMsg(msg);
      })
      .finally(() => {
        alive && setLoading(false);
      });

    return () => {
      alive = false; // กัน setState ตอน unmount
    };
  }, [token]);

  const appearance = { theme: "stripe" };
  const loader = "auto";

  // เคสกุญแจ Stripe หาย
  if (!stripePromise) {
    return (
      <div className="p-4 text-red-600">
        ไม่พบค่า <code>VITE_STRIPE_PK</code> ในไฟล์ .env — กรุณาใส่ Public Key ของ Stripe
      </div>
    );
  }

  // เคสยังไม่ล็อกอิน
  if (!token) {
    return (
      <div className="p-4 text-yellow-700 bg-yellow-50 rounded">
        โปรดเข้าสู่ระบบก่อนทำการชำระเงิน
      </div>
    );
  }

  return (
    <div className="p-4">
      {loading && (
        <div className="mb-3 text-gray-500">กำลังสร้างคำสั่งชำระเงิน…</div>
      )}

      {errMsg && (
        <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {errMsg}
        </div>
      )}

      {clientSecret && (
        <Elements options={{ clientSecret, appearance, loader }} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}
