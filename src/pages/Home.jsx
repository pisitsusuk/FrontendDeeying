// client/src/pages/Home.jsx
import React from "react";
import ContentCarousel from "../components/home/ContentCarousel";
import BestSeller from "../components/home/BestSeller";
import NewProduct from "../components/home/NewProduct";

const Home = () => {
  // ⬇️ ฟังก์ชันเปิดแชตจากหน้า Home
  const openChat = (e) => {
    e?.preventDefault?.();
    if (typeof window !== "undefined") {
      if (typeof window.__openChatBot === "function") {
        window.__openChatBot();
      } else {
        window.dispatchEvent(new CustomEvent("open-chat"));
      }
    }
  };

  return (
    <div className="bg-[#f6f6f6]">
      {/* Hero / Banner */}
      <ContentCarousel />

      {/* Rails */}
      <div className="py-8" />
      <BestSeller />
      <div className="py-6" />
      <NewProduct />

      {/* ====== About Us ====== */}
      <section id="about" className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
                เกี่ยวกับเรา
              </h2>
              <p className="mt-5 text-[15.5px] leading-7 text-neutral-700">
                บริษัท ดียิ่ง ซิสเต็ม จำกัด ให้บริการ
                และจัดจำหน่ายเครื่องชั่งน้ำหนักครบวงจรจากขนาดเล็กไปถึงงานอุตสาหกรรมหนัก
                พร้อมทีมช่างผู้เชี่ยวชาญ ให้คำปรึกษา ติดตั้ง และบำรุงรักษา
                เพื่อความแม่นยำและประสิทธิภาพสูงสุดของลูกค้า
              </p>
              <p className="mt-4 text-[15.5px] leading-7 text-neutral-700">
                ด้วยประสบการณ์กว่า 20 ปี เรามุ่งพัฒนาเทคโนโลยีอย่างต่อเนื่อง
                ตอบโจทย์งานชั่งทุกรูปแบบในโรงงานอาหาร รถบรรทุก
                โลจิสติกส์ และอีกหลากหลายอุตสาหกรรม
              </p>

              <div className="mt-6 flex gap-3">
                {/* ปล่อยปุ่มนี้พาไป section ตามเดิม */}
                <a
                  href="#services"
                  className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90 active:scale-[0.99] transition"
                >
                  บริการของเรา
                </a>
                {/* ⬇️ ปุ่มนี้เด้งแชทบอท */}
                <a
                  href="#"
                  onClick={openChat}
                  className="inline-flex items-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100 active:scale-[0.99] transition"
                >
                  ติดต่อเรา
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden ring-1 ring-black/10 shadow-[0_30px_80px_rgba(0,0,0,.15)]">
                <img
                  src="/494921972_2405603133146978_5487163337179518174_n.jpg"
                  alt="about"
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: "16 / 11" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* คลื่นคั่นแบบ Apple นิดๆ */}
      <div className="relative h-10 overflow-hidden">
        <svg
          viewBox="0 0 1440 80"
          className="absolute inset-0 w-full h-full text-[#1f2327]"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,64L48,58.7C96,53,192,43,288,37.3C384,32,480,32,576,37.3C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32V80H0Z" />
        </svg>
      </div>

      {/* ====== Services (Dark Section) ====== */}
      <section id="services" className="bg-[#1f2327] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
                บริการของเรา
              </h2>
              <p className="mt-5 text-[15.5px] leading-7 text-white/80">
                ให้บริการออกแบบ ติดตั้ง ปรับเทียบ และซ่อมบำรุงเครื่องชั่งทุกชนิด
                ครอบคลุมตั้งแต่งานตั้งพื้น โต๊ะชั่ง รถบรรทุก ไปจนถึงระบบชั่งอินไลน์ในสายการผลิต
              </p>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[15px]">
                <li className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">✓ ออกแบบระบบชั่งเฉพาะงาน</li>
                <li className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">✓ ติดตั้ง & เดินระบบครบวงจร</li>
                <li className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">✓ บริการสอบเทียบ (Calibration)</li>
                <li className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">✓ ซ่อมบำรุงและดูแลหลังการขาย</li>
              </ul>

              <div className="mt-6">
                {/* ⬇️ ปุ่มนี้เด้งแชทบอท */}
                <a
                  href="#"
                  onClick={openChat}
                  className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 active:scale-[0.99] transition"
                >
                  ขอคำปรึกษา
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-[0_30px_80px_rgba(0,0,0,.35)]">
                <img
                  src="/495376886_2405603209813637_3060048929498087923_n.jpg"
                  alt="services"
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: "16 / 11" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Footer ====== */}
      <footer id="contact" className="bg-white text-neutral-800 border-t border-black/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="text-xl font-bold">ดียิ่ง ซิสเต็ม จำกัด</div>
              <p className="mt-3 text-sm text-neutral-600">
                ผู้เชี่ยวชาญด้านเครื่องชั่งครบวงจร พร้อมทีมงาน
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold text-neutral-900">CONTACTS</div>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li>สำนักงานใหญ่ นครราชสีมา</li>
                <li>โทร 092-283-8376</li>
                <li>อีเมล info@DeeyingSystem.co.th</li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-neutral-900">COMPANY</div>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li><a href="#about" className="hover:underline">เกี่ยวกับเรา</a></li>
                <li><a href="#services" className="hover:underline">บริการของเรา</a></li>
                <li><a href="/shop" className="hover:underline">สินค้า</a></li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-neutral-900">SOCIAL</div>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li>Facebook / Line / YouTube</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-black/5 pt-6 text-xs text-neutral-500">
            Copyright © {new Date().getFullYear()} Deeying System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
