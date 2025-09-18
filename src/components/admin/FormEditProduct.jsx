// FormEditProduct.jsx
import React, { useEffect, useState, useMemo } from "react";
import useEcomStore from "../../store/ecom-store";
import { readProduct, updateProduct } from "../../api/product";
import { toast } from "react-toastify";
import Uploader from "./Uploader.jsx";
import { useParams, useNavigate, Link } from "react-router-dom";

const emptyForm = {
  title: "",
  description: "",
  price: 0,
  quantity: 0,
  categoryId: "",
  images: [],
};

const FormEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = useEcomStore((s) => s.token);
  const getCategory = useEcomStore((s) => s.getCategory);
  const categories = useEcomStore((s) => s.categories);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // โหลดหมวดหมู่ + รายละเอียดสินค้า
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await getCategory();
        const res = await readProduct(token, id);
        // backend ส่ง product object ตรง ๆ
        setForm({
          title: res.data?.title ?? "",
          description: res.data?.description ?? "",
          price: Number(res.data?.price ?? 0),
          quantity: Number(res.data?.quantity ?? 0),
          categoryId: res.data?.categoryId ?? "",
          images: Array.isArray(res.data?.images) ? res.data.images : [],
        });
      } catch (err) {
        console.log("Err fetch data", err);
        toast.error("โหลดข้อมูลสินค้าไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  // แปลงค่าตัวเลขอัตโนมัติ
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "quantity"
          ? Number(value)
          : value,
    }));
  };

  const canSave = useMemo(() => {
    return (
      form.title?.trim() &&
      !Number.isNaN(form.price) &&
      !Number.isNaN(form.quantity) &&
      String(form.categoryId).length > 0
    );
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    try {
      setSaving(true);
      const res = await updateProduct(token, id, form);
      toast.success(`แก้ไขข้อมูล ${res.data.title} สำเร็จ`);
      navigate("/admin/product");
    } catch (err) {
      console.log(err);
      toast.error("แก้ไขสินค้าไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-56 rounded bg-gray-200" />
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-10 rounded bg-gray-100" />
              <div className="h-10 rounded bg-gray-100" />
              <div className="h-10 rounded bg-gray-100" />
              <div className="h-10 rounded bg-gray-100" />
              <div className="md:col-span-2 h-28 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            แก้ไขสินค้า
          </h1>
          <p className="mt-1 text-sm text-gray-500">ID: {id}</p>
        </div>
        <Link
          to="/admin/product"
          className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          กลับไปหน้ารายการ
        </Link>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {/* ชื่อสินค้า */}
          <div className="space-y-1">
            <label className="text-sm font-medium">ชื่อสินค้า</label>
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.title}
              onChange={handleOnChange}
              placeholder="เช่น เสื้อยืด SYLVA"
              name="title"
              required
            />
          </div>

          {/* หมวดหมู่ */}
          <div className="space-y-1">
            <label className="text-sm font-medium">หมวดหมู่</label>
            <select
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              name="categoryId"
              onChange={handleOnChange}
              required
              value={form.categoryId ?? ""}
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

          {/* ราคา */}
          <div className="space-y-1">
            <label className="text-sm font-medium">ราคา (บาท)</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.price}
              onChange={handleOnChange}
              placeholder="0"
              name="price"
              required
            />
          </div>

          {/* จำนวน */}
          <div className="space-y-1">
            <label className="text-sm font-medium">จำนวนในสต็อก</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.quantity}
              onChange={handleOnChange}
              placeholder="0"
              name="quantity"
              required
            />
          </div>

          {/* รายละเอียด */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium">รายละเอียด</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.description}
              onChange={handleOnChange}
              placeholder="รายละเอียดสินค้า ขนาด เนื้อผ้า วิธีดูแล ฯลฯ"
              name="description"
            />
          </div>

          {/* อัปโหลดภาพ */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">รูปภาพ</label>
            
            <Uploader form={form} setForm={setForm} token={token} />

            <p className="mt-1 text-xs text-gray-400">
              รองรับหลายรูป ภาพแรกจะเป็นรูปหน้าปก
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !canSave}
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/product")}
            className="rounded-xl border px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormEditProduct;
