// HeaderAdmin.jsx
import React from "react";
import { Link } from "react-router-dom";

function HeaderAdmin() {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b bg-white">
      <h1 className="font-semibold">Admin Panel</h1>
      
      {/* ✅ ปุ่มกลับหน้า Home */}
      <Link
        to="/"
        className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100"
      >
        กลับหน้า Home
      </Link>
    </header>
  );
}

export default HeaderAdmin;
