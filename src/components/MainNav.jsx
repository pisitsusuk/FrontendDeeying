// src/components/MainNav.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import { ChevronDown } from "lucide-react";

function MainNav() {
  const carts  = useEcomStore((s) => s.carts) || [];
  const user   = useEcomStore((s) => s.user);
  const logout = useEcomStore((s) => s.logout);

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((v) => !v);
  const closeDropdown  = () => setIsOpen(false);

  const isAdmin = user?.role === "admin";
  const { pathname } = useLocation();

  // ===== ชื่อ + สถานะ =====
  const displayName =
    user?.name ||
    user?.username ||
    (user?.email ? String(user.email).split("@")[0] : "User");

  const roleLabel = isAdmin ? "Admin" : "User";
  const roleBadgeClass = isAdmin
    ? "bg-amber-500 text-white"
    : "bg-neutral-700 text-white";

  // ✅ แหล่งรูปโปรไฟล์: ใช้ user.picture ก่อน ถ้าไม่มีใช้อวาตาร์ตัวอักษร (โทนดำ-ขาว)
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=111827&color=ffffff&bold=true&rounded=true`;
  const avatarSrc = (user?.picture && String(user.picture)) || fallbackAvatar;

  // ปิด dropdown เมื่อคลิกนอก/กด ESC/เปลี่ยนหน้า
  const menuRef = useRef(null);
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // คลาสสำหรับ NavLink (สไตล์ Apple โทนขาวดำ)
  const navItemClass = ({ isActive }) =>
    [
      "px-3 py-2 rounded-full text-sm font-medium transition",
      isActive
        ? "bg-black text-white shadow-sm"
        : "text-neutral-900 hover:bg-neutral-100",
    ].join(" ");

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="select-none text-2xl font-semibold tracking-tight text-neutral-900"
            >
              <img src="/logo.png" alt="DeeYing" className="h-8 w-auto" loading="lazy" />
            </Link>

            <NavLink to="/" end className={navItemClass}>
              Home
            </NavLink>

            <NavLink to="/shop" className={navItemClass}>
              Shop
            </NavLink>

            <div className="relative">
              <NavLink to="/cart" className={navItemClass}>
                Cart
              </NavLink>
              {carts.length > 0 && (
                <span
                  className="absolute -right-2 -top-1 rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white shadow ring-1 ring-black/10"
                  aria-label={`มีสินค้าในตะกร้า ${carts.length} รายการ`}
                >
                  {carts.length}
                </span>
              )}
            </div>
          </div>

          {/* Right */}
          {user ? (
            <div className="relative flex items-center gap-3" ref={menuRef}>
              {/* ชื่อ + badge */}
              <div className="hidden flex-col items-end leading-tight sm:flex">
                <span className="text-sm font-medium text-neutral-900">
                  {displayName}
                </span>
                <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[11px] ${roleBadgeClass}`}>
                  {roleLabel}
                </span>
              </div>

              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 rounded-full px-2 py-2 transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
                aria-haspopup="menu"
                aria-expanded={isOpen}
              >
                {/* ✅ ใช้ avatarSrc แทนรูปม่วงเดิม + fallback อัตโนมัติเมื่อโหลดรูปพัง */}
                <img
                  className="h-9 w-9 rounded-full ring-1 ring-white/60 shadow-sm"
                  src={avatarSrc}
                  alt="avatar"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (e.currentTarget.src !== fallbackAvatar) {
                      e.currentTarget.src = fallbackAvatar;
                    }
                  }}
                />
                <ChevronDown
                  className={`h-4 w-4 text-neutral-700 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div
                  className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
                  role="menu"
                >
                  {/* Header */}
                  <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div className="text-sm font-semibold text-neutral-900">
                      {displayName}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${roleBadgeClass}`}>
                        {roleLabel}
                      </span>
                      {user?.email && (
                        <span className="truncate text-xs text-neutral-500">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Admin link */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-100"
                      onClick={closeDropdown}
                      role="menuitem"
                    >
                      Dashboard
                    </Link>
                  )}

                  <Link
                    to="/user/history"
                    className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-100"
                    onClick={closeDropdown}
                    role="menuitem"
                  >
                    History
                  </Link>

                  {/* ปุ่มกลับหน้าเว็บ เมื่ออยู่ใน /admin */}
                  {pathname.startsWith("/admin") && (
                    <Link
                      to="/"
                      className="block px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-100"
                      onClick={closeDropdown}
                      role="menuitem"
                    >
                      กลับหน้าเว็บ
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      closeDropdown();
                      logout();
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-neutral-900 hover:bg-neutral-100"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink to="/register" className={navItemClass}>
                Register
              </NavLink>
              <NavLink to="/login" className={navItemClass}>
                Login
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default MainNav;
