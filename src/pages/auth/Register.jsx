// client/src/pages/auth/Register.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import zxcvbn from "zxcvbn";
import { useForm } from "react-hook-form";

const registerSchema = z
  .object({
    email: z.string().email({ message: "อีเมลไม่ถูกต้อง" }),
    password: z
      .string()
      .min(8, { message: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร" }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  "https://backenddeeying.onrender.com";

const Register = () => {
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(registerSchema) });

  const password = watch("password") || "";
  const score = useMemo(() => zxcvbn(password).score, [password]); // 0-4

  // ป้องกัน submit ตอนพาสยังอ่อนมาก
  const canSubmit = !loading && !isSubmitting && password.length >= 8;

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // กำหนดเกณฑ์: ต้องได้คะแนน >= 2 (พอใช้ขึ้นไป)
      if (zxcvbn(data.password).score < 2) {
        toast.warning("รหัสผ่านยังอ่อนเกินไป ลองเพิ่มความซับซ้อนอีกนิด");
        return;
      }

      const res = await axios.post(
        `${API_BASE.replace(/\/$/, "")}/api/register`,
        { email: data.email, password: data.password }
      );

      toast.success(res?.data?.message || "ลงทะเบียนสำเร็จ");
      reset({ email: "", password: "", confirmPassword: "" });
    } catch (err) {
      const errMsg = err?.response?.data?.message || "สมัครไม่สำเร็จ";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = ["อ่อนมาก", "อ่อน", "พอใช้", "ดี", "แข็งแรง"][score];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-xl p-10">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold text-gray-900">Create account</h1>
            <p className="text-gray-500 text-sm mt-2">
              ลงทะเบียนเพื่อเริ่มต้นการช้อปที่ DeeYing
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                {...register("email")}
                type="email"
                placeholder="example@email.com"
                className={`mt-1 w-full rounded-xl border ${
                  errors.email ? "border-red-400" : "border-gray-300"
                } bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black transition`}
              />
              {errors.email && (
                <p className="mt-1 text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  className={`mt-1 w-full rounded-xl border ${
                    errors.password ? "border-red-400" : "border-gray-300"
                  } bg-gray-50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <>
                  <div className="flex gap-1 mt-3" aria-hidden>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i <= score
                            ? score < 2
                              ? "bg-red-500"
                              : score < 4
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">ความแข็งแรง: {strengthLabel}</p>
                  <ul className="mt-2 text-xs text-gray-500 list-disc list-inside">
                    <li>ความยาว &ge; 8</li>
                    <li>ผสมตัวใหญ่/เล็ก ตัวเลข และสัญลักษณ์ จะปลอดภัยกว่า</li>
                  </ul>
                </>
              )}
              {errors.password && (
                <p className="mt-1 text-red-600 text-sm">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  type={showPw2 ? "text" : "password"}
                  placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง"
                  className={`mt-1 w-full rounded-xl border ${
                    errors.confirmPassword ? "border-red-400" : "border-gray-300"
                  } bg-gray-50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                  aria-label={showPw2 ? "Hide password" : "Show password"}
                >
                  {showPw2 ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-red-600 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-xl bg-black px-4 py-3 text-white font-semibold shadow-md transition ${
                canSubmit ? "hover:bg-gray-800 active:scale-[0.98]" : "opacity-60 cursor-not-allowed"
              }`}
            >
              {loading ? "กำลังสมัครสมาชิก..." : "Create account"}
            </button>

            {/* Tips / Policy (optional) */}
            <p className="text-xs text-gray-500 text-center">
              การสมัครถือว่ายอมรับนโยบายความเป็นส่วนตัวของเรา
            </p>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} DeeYing System.Inspired by DeeYing
        </p>
      </div>
    </div>
  );
};

export default Register;
