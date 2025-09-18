import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCog,
  SquareChartGantt,
  ShoppingBasket,
  ListOrdered,
  LogOut,
  CreditCard,
} from "lucide-react";
import useEcomStore from "../../store/ecom-store";
import Logo from "../../assets/logo.png"; // ใส่โลโก้ของนาย (ถ้าไม่มีลบ <img> ได้)

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const logout = useEcomStore((s) => s.logout);

  const linkCls = ({ isActive }) =>
    [
      "flex items-center gap-3 px-4 py-2 rounded-xl transition-all",
      "text-gray-700 hover:bg-gray-100 hover:scale-[1.01]",
      isActive && "bg-black text-white shadow-md hover:bg-black hover:scale-100",
    ]
      .filter(Boolean)
      .join(" ");

  const handleLogout = () => {
    try {
      logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 bg-white/70 backdrop-blur-xl border-r border-gray-200 shadow-xl flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 flex items-center gap-3">
        <img src={Logo} alt="DeeYing" className="w-9 h-9 object-contain rounded-xl" />
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-gray-900 leading-none">Admin Panel</span>
          <span className="text-xs text-gray-500">DeeYing System</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 space-y-2 overflow-y-auto pb-4">
        <NavLink to="/admin" end className={linkCls}>
          <LayoutDashboard size={18} />
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <NavLink to="manage" className={linkCls}>
          <UserCog size={18} />
          <span className="font-medium">Manage</span>
        </NavLink>

        <NavLink to="category" className={linkCls}>
          <SquareChartGantt size={18} />
          <span className="font-medium">Category</span>
        </NavLink>

        <NavLink to="product" className={linkCls}>
          <ShoppingBasket size={18} />
          <span className="font-medium">Product</span>
        </NavLink>

        <NavLink to="approve" className={linkCls}>
          <ListOrdered size={18} />
          <span className="font-medium">Approve</span>
        </NavLink>

        <NavLink to="bank-info" className={linkCls}>
          <CreditCard size={18} />
          <span className="font-medium">Bank Info</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
