// AppleRail.jsx
import React from "react";
import { Swiper } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const AppleRail = ({ children }) => {
  return (
    <div className="apple-rail relative">
      <Swiper
        className="apple-swiper"
        modules={[Navigation, FreeMode]}
        navigation
        freeMode
        slidesPerView={1.05}
        spaceBetween={16}
        breakpoints={{
          640: { slidesPerView: 1.2, spaceBetween: 18 },
          768: { slidesPerView: 1.6, spaceBetween: 20 },
          1024: { slidesPerView: 2.2, spaceBetween: 22 },
          1280: { slidesPerView: 3, spaceBetween: 24 },
        }}
      >
        {children}
      </Swiper>

      {/* ปรับโทนลูกศร */}
      <style>{`
        .apple-swiper .swiper-button-prev,
        .apple-swiper .swiper-button-next{
          width:42px;height:42px;border-radius:9999px;
          background:rgba(255,255,255,.9);
          box-shadow:0 8px 24px rgba(0,0,0,.12);
          border:1px solid rgba(0,0,0,.06);
        }
        .apple-swiper .swiper-button-prev:after,
        .apple-swiper .swiper-button-next:after{
          font-size:16px;color:#111827;font-weight:700;
        }
      `}</style>
    </div>
  );
};

export default AppleRail;
