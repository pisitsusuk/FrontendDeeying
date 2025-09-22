// client/src/components/admin/FormProduct.jsx
import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { createProduct, deleteProduct } from "../../api/product";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Pencil, Trash, PlusCircle } from "lucide-react";
import { numberFormat } from "../../utils/number";
import { dateFormat } from "../../utils/dateformat";
import Uploader from "./Uploader.jsx";

const initialState = {
  title: "",
  description: "",
  price: 0,
  quantity: 0,
  categoryId: "",
  images: [],
};

const iosBlue = "#0A84FF";

const FormProduct = () => {
  const token = useEcomStore((s) => s.token);
  const getCategory = useEcomStore((s) => s.getCategory);
  const categories = useEcomStore((s) => s.categories) || [];
  const getProduct = useEcomStore((s) => s.getProduct);
  const products = useEcomStore((s) => s.products) || [];

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategory();
    getProduct(100);
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "quantity" ? Number(value) : value,
    }));
  };

  const doReset = () => setForm(initialState);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await createProduct(token, form);
      toast.success(`เพิ่มข้อมูล ${res.data.title} สำเร็จ`);
      doReset();
      getProduct(100);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "เพิ่มสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ลบสินค้านี้ใช่ไหม?")) return;
    try {
      setLoading(true);
      await deleteProduct(token, id);
      toast.success("ลบสินค้าเรียบร้อย");
      getProduct(100);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "ลบสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, #DDEBFF 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #FEE7F4 0%, transparent 55%), linear-gradient(180deg, #FAFAFC 0%, #F4F6F9 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl p-6 lg:p-10">
        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            จัดการสินค้า
          </h1>
          <span className="rounded-full bg-white/60 px-3 py-1 text-sm text-gray-600 backdrop-blur-md ring-1 ring-black/5">
            ทั้งหมด {products.length} รายการ
          </span>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[22px] border border-white/30 bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5"
        >
          <div className="mb-6 flex items-center gap-2">
            <div
              className="rounded-xl p-2 text-white shadow"
              style={{ background: iosBlue }}
            >
              <PlusCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">
              เพิ่มข้อมูลสินค้า
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                ชื่อสินค้า
              </label>
              <input
                className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                value={form.title}
                onChange={handleOnChange}
                placeholder="เช่น เสื้อยืด SYLVA"
                name="title"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                หมวดหมู่
              </label>
              <select
                className="w-full appearance-none rounded-2xl border border-white/40 bg-white/80 px-4 py-3 pr-10 text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                name="categoryId"
                onChange={handleOnChange}
                required
                value={form.categoryId}
              >
                <option value="" disabled>
                  เลือกหมวดหมู่
                </option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                ราคา (บาท)
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                value={form.price}
                onChange={handleOnChange}
                placeholder="0"
                name="price"
                required
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                จำนวนในสต็อก
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                value={form.quantity}
                onChange={handleOnChange}
                placeholder="0"
                name="quantity"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                รายละเอียด
              </label>
              <textarea
                rows={3}
                className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                value={form.description}
                onChange={handleOnChange}
                placeholder="รายละเอียดสินค้า ขนาด เนื้อผ้า วิธีดูแล ฯลฯ"
                name="description"
              />
            </div>

            {/* Uploader */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                รูปภาพ
              </label>
              <div className="rounded-2xl border border-white/40 bg-white/60 p-3 backdrop-blur-md ring-1 ring-black/5">
                <Uploader form={form} setForm={setForm} token={token} />
                <p className="mt-2 text-xs text-gray-500">
                  รองรับหลายรูป ภาพแรกจะเป็นรูปหน้าปก
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl px-5 py-2.5 font-medium text-white shadow-md transition active:scale-[.99] disabled:opacity-60"
              style={{ background: iosBlue, boxShadow: "0 6px 14px rgba(10,132,255,0.25)" }}
            >
              {loading ? "กำลังบันทึก..." : "เพิ่มสินค้า"}
            </button>
            <button
              type="button"
              onClick={doReset}
              disabled={loading}
              className="rounded-2xl border border-white/60 bg-white/70 px-5 py-2.5 font-medium text-gray-700 shadow-sm backdrop-blur-md transition hover:bg-white active:scale-[.99] disabled:opacity-60"
            >
              รีเซ็ตฟอร์ม
            </button>
          </div>
        </form>

        {/* List Card */}
        <div className="mt-8 overflow-hidden rounded-[22px] border border-white/30 bg-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5">
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 backdrop-blur-xl">
                <tr className="bg-white/70 text-gray-800 [&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
                  <th className="w-16">No.</th>
                  <th className="w-40">รูปภาพ</th>
                  <th>ชื่อสินค้า</th>
                  <th className="min-w-[260px]">รายละเอียด</th>
                  <th className="w-28">ราคา</th>
                  <th className="w-24">สต็อก</th>
                  <th className="w-28">ขายแล้ว</th>
                  <th className="w-40">อัปเดตล่าสุด</th>
                  <th className="w-28 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                        <div className="h-10 w-10 rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md" />
                        <p className="text-sm">ยังไม่มีสินค้า ลองเพิ่มสินค้าด้านบนสิ 🔥</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((item, index) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-white/60"
                    >
                      <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3">
                        {item.images?.length ? (
                          <img
                            className="h-20 w-20 rounded-2xl object-cover shadow-md ring-1 ring-black/5"
                            src={item.images[0].secure_url || item.images[0].url}
                            alt={item.title}
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/50 bg-white/60 text-xs text-gray-400 backdrop-blur">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="line-clamp-2">{item.description}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {numberFormat(item.price)}
                      </td>
                      <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-gray-900">{item.sold}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {dateFormat(item.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/admin/product/${item.id}`}
                            className="rounded-xl px-2.5 py-2 text-white shadow transition active:scale-[.98]"
                            style={{ background: "#FF9F0A" }}
                            aria-label="แก้ไข"
                            title="แก้ไข"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={loading}
                            className="rounded-xl px-2.5 py-2 text-white shadow transition active:scale-[.98] disabled:opacity-60"
                            style={{ background: "#FF3B30" }}
                            aria-label="ลบ"
                            title="ลบ"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default FormProduct;
