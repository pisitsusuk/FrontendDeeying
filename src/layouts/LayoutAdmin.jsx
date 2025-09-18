// src/layouts/LayoutAdmin.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/admin/SidebarAdmin";
import HeaderAdmin from "../components/admin/HeaderAdmin";

const LayoutAdmin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      {/* Sidebar = fixed ซ้าย */}
      <SidebarAdmin />

      {/* เนื้อหาเว้นระยะจาก sidebar 16rem */}
      <div className="ml-64 flex min-h-screen flex-col">
        <HeaderAdmin />

        <main className="flex-1 px-6 py-6 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;
