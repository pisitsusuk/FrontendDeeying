import React, { useState } from "react";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../../assets/logo.png"; // 👈 ใช้โลโก้ใหม่

const Login = () => {
  const navigate = useNavigate();
  const actionLogin = useEcomStore((s) => s.actionLogin);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleOnChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const roleRedirect = (role) => {
    if (role === "admin") navigate("/admin");
    else navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setLoading(true);
    try {
      const res = await actionLogin(form);
      if (res?.data) {
        const role = res.data.payload.role;
        toast.success("Welcome back!");
        roleRedirect(role);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Login failed";
      setApiError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-xl p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={Logo}
              alt="Deeying Logo"
              className="w-20 h-20 object-contain mb-3 drop-shadow-lg" // ✅ ปรับให้โลโก้ดูเด่น
            />
            <h1 className="text-3xl font-semibold text-gray-900">
              Sign in with Deeying
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              เข้าสู่ระบบเพื่อใช้งานฟีเจอร์ทั้งหมด 🛒
            </p>
          </div>

          {/* Error banner */}
          {apiError ? (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-red-600 text-sm">
              {apiError}
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="example@email.com"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black transition"
                onChange={handleOnChange}
                value={form.email}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black transition"
                  onChange={handleOnChange}
                  value={form.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Actions */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl bg-black px-4 py-3 text-white font-semibold shadow-md transition ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-gray-800 active:scale-[0.98]"
              }`}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "Sign in"}
            </button>

            {/* Extras */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                ยังไม่มีบัญชี?{" "}
                <Link
                  to="/register"
                  className="text-black hover:underline font-medium"
                >
                  สมัครสมาชิก
                </Link>
              </span>
              <Link
                to="/forgot-password"
                className="text-gray-600 hover:text-black transition"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} DeeYing System. Inspired by DeeYing
        </p>
      </div>
    </div>
  );
};

export default Login;
