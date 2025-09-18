import React from "react";
import SidebarAdmin from "./SidebarAdmin";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Sidebar fixed */}
      <SidebarAdmin />

      {/* เนื้อหาหลัก: เว้นจาก sidebar + padding + จัดกึ่งกลาง */}
      <main className="ml-64 px-6 py-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
