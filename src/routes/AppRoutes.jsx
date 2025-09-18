// src/routes/AppRoutes.jsx
// rafce
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "../pages/Home";
import Shop from "../pages/Shop";
import Cart from "../pages/Cart";
import History from "../pages/user/History";
import Checkout from "../pages/Checkout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Layout from "../layouts/Layout";
import LayoutAdmin from "../layouts/LayoutAdmin";
import Dashboard from "../pages/admin/Dashboard";
import Product from "../pages/admin/Product";
import Category from "../pages/admin/Category";
import Manage from "../pages/admin/Manage";
import LayoutUser from "../layouts/LayoutUser";
import HomeUser from "../pages/user/HomeUser";
import ProtectRouteUser from "./ProtectRouteUser";
import ProtectRouteAdmin from "./ProtectRouteAdmin";
import EditProduct from "../pages/admin/EditProduct";
import Payment from "../pages/user/Payment";
import ManageOrders from "../pages/admin/ManageOrders";
import Approve from "../pages/admin/Approve";
import PaymentSlip from "../pages/user/PaymentSlip"; // ✅ เพิ่ม import
import BankInfoAdmin from "../pages/admin/BankInfoAdmin"; // ✅ เพิ่ม import

// ✅ หน้า error สำหรับ Data Router (รองรับ ErrorResponseImpl)
import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";

function ErrorPage({ status }) {
  const err = useRouteError();
  let title = "เกิดข้อผิดพลาด";
  let message = "ระบบพบปัญหาในการโหลดหน้านี้";

  if (status === 404) {
    title = "ไม่พบหน้า (404)";
    message = "ขออภัย ไม่พบหน้าที่คุณต้องการ";
  } else if (isRouteErrorResponse(err)) {
    title = `Error ${err.status}`;
    message = err.statusText || "เกิดข้อผิดพลาดจาก Route";
  } else if (err instanceof Error) {
    message = err.message;
  }

  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h1>{title}</h1>
      <p>{message}</p>
      {err && !(status === 404) && (
        <pre
          style={{
            textAlign: "left",
            display: "inline-block",
            marginTop: 16,
            maxWidth: 600,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}
        </pre>
      )}
      <div style={{ marginTop: 12 }}>
        <Link to="/">กลับหน้าแรก</Link>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "shop", element: <Shop /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/admin",
    element: <ProtectRouteAdmin element={<LayoutAdmin />} />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "category", element: <Category /> },
      { path: "product", element: <Product /> },
      { path: "product/:id", element: <EditProduct /> },
      { path: "manage", element: <Manage /> },
      { path: "orders", element: <ManageOrders /> },
      { path: "approve", element: <Approve /> },
      // เพิ่มเส้นทางใหม่สำหรับจัดการข้อมูลธนาคาร
      { path: "bank-info", element: <BankInfoAdmin /> },
    ],
  },
  {
    path: "/user",
    element: <ProtectRouteUser element={<LayoutUser />} />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomeUser /> },
      { path: "payment", element: <Payment /> },
      { path: "payment-slip", element: <PaymentSlip /> },
      { path: "history", element: <History /> },
    ],
  },
  {
    path: "*",
    element: <ErrorPage status={404} />,
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
