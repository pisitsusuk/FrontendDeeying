// client/src/components/admin/FormCategory.jsx
import React, { useState, useEffect, useRef } from "react";
import { createCategory, removeCategory, updateCategory } from "../../api/Category";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";

const iosBlue = "#0A84FF";

const FormCategory = () => {
  const token = useEcomStore((s) => s.token);
  const categories = useEcomStore((s) => s.categories);
  const getCategory = useEcomStore((s) => s.getCategory);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const inputRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    getCategory(token);
  }, [getCategory, token]);

  // ------- สร้างใหม่ -------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = name.trim();
    if (!value) return toast.warning("กรอกชื่อหมวดหมู่ก่อนนะ");
    try {
      setSaving(true);
      const res = await createCategory(token, { name: value });
      toast.success(`เพิ่มหมวดหมู่ “${res.data?.name ?? value}” สำเร็จ`);
      setName("");
      getCategory(token);
      inputRef.current?.focus();
    } catch (err) {
      console.log(err);
      toast.error("เพิ่มหมวดหมู่ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // ------- ลบ -------
  const handleRemove = async (id, label) => {
    if (!window.confirm(`ลบหมวดหมู่ “${label}” ใช่ไหม?`)) return;
    try {
      setRemovingId(id);
      await removeCategory(token, id);
      toast.success(`ลบ “${label}” เรียบร้อย`);
      getCategory(token);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "ลบหมวดหมู่ไม่สำเร็จ");
    } finally {
      setRemovingId(null);
    }
  };

  // ------- แก้ไข -------
  const startEdit = (c) => {
    setEditingId(c.id);
    setEditValue(c.name || "");
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    const value = (editValue || "").trim();
    if (!value) return toast.warning("ใส่ชื่อหมวดหมู่ก่อนนะ");
    try {
      setUpdatingId(editingId);
      await updateCategory(token, editingId, { name: value });
      toast.success("อัปเดตหมวดหมู่เรียบร้อย");
      setEditingId(null);
      setEditValue("");
      getCategory(token);
    } catch (err) {
      console.log(err);
      toast.error("อัปเดตหมวดหมู่ไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  };

  const onEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
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
      <div className="mx-auto max-w-5xl p-6 lg:p-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            จัดการหมวดหมู่
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            เพิ่ม/แก้ไข/ลบหมวดหมู่สินค้า เพื่อช่วยให้ค้นหาสินค้าได้ง่ายขึ้น
          </p>
        </div>

        {/* Card: Add */}
        <div className="rounded-[22px] border border-white/30 bg-white/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="เช่น เสื้อผ้า, รองเท้า, อุปกรณ์เสริม"
              maxLength={80}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="rounded-2xl px-5 py-2.5 font-medium text-white shadow-md transition active:scale-[.99] disabled:opacity-60"
                style={{ background: iosBlue, boxShadow: "0 6px 14px rgba(10,132,255,0.25)" }}
              >
                {saving ? "กำลังเพิ่ม..." : "เพิ่มหมวดหมู่"}
              </button>
              <button
                type="button"
                onClick={() => setName("")}
                className="rounded-2xl border border-white/60 bg-white/70 px-5 py-2.5 font-medium text-gray-700 shadow-sm backdrop-blur-md transition hover:bg-white active:scale-[.99]"
              >
                เคลียร์
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="mt-6 rounded-[22px] border border-white/30 bg-white/70 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl ring-1 ring-black/5">
          {!categories || categories.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              ยังไม่มีหมวดหมู่ ลองเพิ่มด้านบนดูสิ 🔥
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl border border-white/50 bg-white/60 px-4 py-3 shadow-sm backdrop-blur transition hover:bg-white hover:shadow-md"
                >
                  {/* ซ้าย: ชื่อ/แก้ไข */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 ring-1 ring-black/5">
                      {c.name?.[0]?.toUpperCase() ?? "?"}
                    </div>

                    <div className="min-w-0">
                      {editingId === c.id ? (
                        <input
                          ref={editRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={onEditKeyDown}
                          className="w-56 rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-sm text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                          maxLength={80}
                        />
                      ) : (
                        <p className="truncate font-medium text-gray-900">{c.name}</p>
                      )}
                    </div>
                  </div>

                  {/* ขวา: ปุ่มต่าง ๆ */}
                  <div className="flex items-center gap-2">
                    {editingId === c.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          disabled={updatingId === c.id || !editValue.trim()}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition active:scale-[.98] disabled:opacity-60"
                        >
                          {updatingId === c.id ? "กำลังบันทึก..." : "บันทึก"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-xl border border-white/60 bg-white/70 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur transition hover:bg-white active:scale-[.98]"
                        >
                          ยกเลิก
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(c)}
                          className="rounded-xl border border-white/60 bg-white/70 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur transition hover:bg-white active:scale-[.98]"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleRemove(c.id, c.name)}
                          disabled={removingId === c.id}
                          className="rounded-xl px-3 py-1.5 text-sm font-medium text-white shadow-sm transition active:scale-[.98] disabled:opacity-60"
                          style={{ background: "#FF3B30" }}
                        >
                          {removingId === c.id ? "กำลังลบ..." : "ลบ"}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

       
      </div>
    </div>
  );
};

export default FormCategory;
