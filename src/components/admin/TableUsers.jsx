// src/components/admin/TableUsers.jsx  (iOS glass theme)
import React, { useEffect, useMemo, useState } from "react";
import {
  getListAllUsers,
  changeUserStatus,
  changeUserRole,
} from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";

const iosBlue = "#0A84FF";

// ใช้ค่า API เดียวกับโปรเจ็กต์ (ไม่แตะไฟล์อื่น)
const API_HOST =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";

const TableUsers = () => {
  const token = useEcomStore((state) => state.token);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!token) return;
    handleGetUsers(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleGetUsers = (tk) => {
    setLoading(true);
    getListAllUsers(tk)
      .then((res) => {
        const items = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data)
          ? res.data
          : [];
        setUsers(items);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  const handleChangeUserStatus = async (userId, currentEnabled) => {
    const value = { id: userId, enabled: !currentEnabled };
    try {
      await changeUserStatus(token, value);
      toast.success("อัปเดตสถานะเรียบร้อย");
      handleGetUsers(token);
    } catch (err) {
      toast.error("อัปเดตสถานะไม่สำเร็จ");
      console.log(err);
    }
  };

  const handleChangeUserRole = async (userId, userRole) => {
    const value = { id: userId, role: userRole };
    try {
      await changeUserRole(token, value);
      toast.success("อัปเดตสิทธิ์เรียบร้อย");
      handleGetUsers(token);
    } catch (err) {
      toast.error("อัปเดตสิทธิ์ไม่สำเร็จ");
      console.log(err);
    }
  };

  // ลบผู้ใช้ (DELETE) — ทำเฉพาะไฟล์นี้ ไม่แตะโมดูลอื่น
  const handleDeleteUser = async (userId, email) => {
    const ok = window.confirm(`ยืนยันลบผู้ใช้\n${email || userId}?`);
    if (!ok) return;

    try {
      setDeletingId(userId);
      const res = await fetch(`${API_HOST}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let msg = "ลบผู้ใช้ไม่สำเร็จ";
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch {}
        throw new Error(msg);
      }

      toast.success("ลบผู้ใช้เรียบร้อย");
      handleGetUsers(token);
    } catch (err) {
      console.log(err);
      toast.error(err.message || "ลบผู้ใช้ไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  };

  // ===== client-side filter =====
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (users || [])
      .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
      .filter((u) =>
        term
          ? u.email?.toLowerCase().includes(term) || String(u.id).includes(term)
          : true
      );
  }, [users, q, roleFilter]);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, #DDEBFF 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #FEE7F4 0%, transparent 55%), linear-gradient(180deg, #FAFAFC 0%, #F4F6F9 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl p-6 lg:p-10 space-y-4">
        {/* Header + Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">ผู้ใช้งานระบบ</h2>
            <p className="text-sm text-gray-600">จัดการสิทธิ์และสถานะผู้ใช้</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl border border-white/40 bg-white/70 px-3 py-2 backdrop-blur ring-1 ring-black/5 shadow-sm">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาอีเมลหรือไอดี…"
                className="bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Segmented control สำหรับ role */}
            <div className="rounded-2xl border border-white/40 bg-white/70 p-1 backdrop-blur ring-1 ring-black/5 shadow-sm">
              <div className="flex">
                {[
                  { v: "all", label: "ทั้งหมด" },
                  { v: "user", label: "User" },
                  { v: "admin", label: "Admin" },
                ].map((o) => {
                  const active = roleFilter === o.v;
                  return (
                    <button
                      key={o.v}
                      onClick={() => setRoleFilter(o.v)}
                      className={`px-3 py-1.5 text-sm rounded-xl transition ${
                        active
                          ? "bg-[#0A84FF] text-white shadow"
                          : "text-gray-700 hover:bg-white/80"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[22px] border border-white/30 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 backdrop-blur-xl">
                <tr className="bg-white/70 text-left text-gray-700 uppercase text-xs tracking-wide [&>th]:px-5 [&>th]:py-3">
                  <th>ลำดับ</th>
                  <th>Email</th>
                  <th>สิทธิ์</th>
                  <th>สถานะ</th>
                  <th className="text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  // Skeleton rows
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t border-white/60">
                      <td className="px-5 py-4">
                        <div className="h-4 w-6 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-4 w-56 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-8 w-28 rounded-xl bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="h-9 w-28 rounded-2xl bg-gray-200 animate-pulse inline-block" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length > 0 ? (
                  filtered.map((el, i) => (
                    <tr
                      key={el.id ?? i}
                      className="border-t border-white/60 hover:bg-white/60 transition"
                    >
                      <td className="px-5 py-3 font-medium text-gray-800">{i + 1}</td>
                      <td className="px-5 py-3 text-gray-900">{el.email}</td>

                      {/* Role */}
                      <td className="px-5 py-3">
                        <select
                          value={el.role === "admin" ? "admin" : "user"}
                          onChange={(e) => handleChangeUserRole(el.id, e.target.value)}
                          className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm text-gray-900 shadow-inner outline-none backdrop-blur-sm transition focus:bg-white focus:ring-4 focus:ring-blue-100"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur ring-1 ring-black/5 ${
                            el.enabled
                              ? "bg-emerald-100/80 text-emerald-700 border border-emerald-300"
                              : "bg-red-100/80 text-red-700 border border-red-300"
                          }`}
                        >
                          {el.enabled ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className={`px-4 py-2 rounded-2xl text-white text-xs font-semibold shadow-md transition active:scale-[.98] ${
                              el.enabled
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                            onClick={() => handleChangeUserStatus(el.id, el.enabled)}
                          >
                            {el.enabled ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
                          </button>

                          <button
                            disabled={deletingId === el.id}
                            onClick={() => handleDeleteUser(el.id, el.email)}
                            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition active:scale-[.98] border ${
                              deletingId === el.id
                                ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
                                : "bg-white text-red-600 border-red-300 hover:bg-red-50"
                            }`}
                            title="ลบผู้ใช้"
                          >
                            {deletingId === el.id ? "กำลังลบ…" : "ลบผู้ใช้"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500 italic">
                      ไม่มีผู้ใช้ตามเงื่อนไขค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer meta */}
          {!loading && (
            <div className="flex items-center justify-between px-5 py-3 text-xs text-gray-500">
              <div>ทั้งหมด: {users.length} ผู้ใช้</div>
              <div>แสดงผล: {filtered.length} รายการ</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableUsers;
