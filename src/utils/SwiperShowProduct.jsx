import React from "react";
import { Swiper } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function SwiperShowProduct({ title, children }) {
  return (
    <section className="apple-band">
      {title && <h2 className="apple-band-title">{title}</h2>}

      <Swiper
        modules={[Navigation]}
        navigation
        centeredSlides={false}
        initialSlide={0}
        slidesPerView={1.06}
        spaceBetween={12}
        /* ชิดซ้ายสุด */
        slidesOffsetBefore={0}
        slidesOffsetAfter={0}
        breakpoints={{
          640:  { slidesPerView: 2.05, spaceBetween: 14, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
          1024: { slidesPerView: 3.05, spaceBetween: 16, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
          1280: { slidesPerView: 4.05, spaceBetween: 18, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
        }}
      >
        {children}
      </Swiper>
    </section>
  );
}

/* ---- inject CSS (ธีม Apple + ชิดซ้ายสุด) ---- */
if (typeof document !== "undefined") {
  const css = `
  /* กันหน้าหลุดขอบ/เลื่อนซ้าย-ขวา */
  html,body{max-width:100%; overflow-x:hidden;}

  .apple-band{
    background:#f6f6f6;
    /* full-bleed แบบไม่ทำให้เกิด horizontal scroll */
    margin-left:calc(50% - 50vw);
    margin-right:calc(50% - 50vw);
    width:100vw;
    padding:28px 0 36px;
    box-sizing:border-box;
    overflow:hidden;
  }

  .apple-band-title{
    font-size:28px; font-weight:800; letter-spacing:.2px;
    color:#1d1d1f; margin:0 16px 16px; text-align:left;
  }
  @media (min-width:1024px){
    .apple-band-title{ font-size:34px; margin:0 24px 18px; }
  }

  /* บังคับคอนเทนเนอร์ของ Swiper ให้ชิดซ้ายสุด/เต็มกว้าง */
  .apple-band .swiper{
    width:100% !important;
    max-width:100vw !important;
    margin-left:0 !important;
    margin-right:0 !important;
    padding-left:0 !important;
    padding-right:0 !important;
    display:block;
  }
  /* ให้ wrapper ไม่ถูกเลื่อนเพื่อไปกึ่งกลาง */
  .apple-band .swiper-wrapper{
    transform: translate3d(0,0,0) translateZ(0);
  }

  /* ===== การ์ด (ตามของพี่) ===== */
  .apple-card{
    background:#fff; border-radius:22px;
    border:1px solid rgba(0,0,0,.05);
    box-shadow:0 1px 0 rgba(0,0,0,.03), 0 14px 28px rgba(0,0,0,.07);
    overflow:hidden;
  }
  .apple-imgbox{
    height:220px; display:flex; align-items:center; justify-content:center;
    background:#fff; padding:14px;
  }
  @media (min-width:1024px){ .apple-imgbox{ height:250px; } }
  .apple-card-body{ padding:12px 14px 14px; }
  .apple-card-title{
    font-size:16.5px; line-height:1.25; font-weight:700; color:#1d1d1f;
    margin:6px 0 4px;
  }
  .apple-card-price{ font-size:14px; color:#1d1d1f; font-weight:700; }

  /* ===== ปุ่มเลื่อนวงกลม ===== */
  .apple-band .swiper-button-prev,
  .apple-band .swiper-button-next{
    width:44px; height:44px; border-radius:9999px;
    background:#0B0B0F; color:#fff;
    box-shadow:0 14px 30px rgba(0,0,0,.25);
    border:1px solid rgba(255,255,255,.08);
    top:50%; transform:translateY(-50%);
  }
  .apple-band .swiper-button-prev{ left:8px; }
  .apple-band .swiper-button-next{ right:8px; }
  @media (min-width:1024px){
    .apple-band .swiper-button-prev{ left:14px; }
    .apple-band .swiper-button-next{ right:14px; }
  }
  .apple-band .swiper-button-prev::after,
  .apple-band .swiper-button-next::after{ font-size:16px; font-weight:700; }
  .apple-band .swiper-button-disabled{ opacity:.35 !important; cursor:default; }

  /* ปุ่มแอ็กชันบนการ์ด (เล็กลง) */
  .apple-act{ display:flex; gap:8px; }
  .apple-act-btn{
    width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center;
    border-radius:9999px; background:#0b0b0f; color:#fff;
    box-shadow:0 10px 22px rgba(0,0,0,.18);
    border:1px solid rgba(255,255,255,.08);
    cursor:pointer; transition:transform .12s ease, opacity .12s ease;
  }
  .apple-act-btn:hover{ opacity:.9; }
  .apple-act-btn:active{ transform:translateY(1px); }
  .apple-act-btn svg{ width:16px; height:16px; }
  `;
  const el = document.createElement("style");
  el.textContent = css;
  document.head.appendChild(el);
}
