// client/src/components/home/ContentCarousel.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const BANNERS = [
  {
    url: "https://7space.sgp1.digitaloceanspaces.com/9I00/1537216178.a1cf02e1e5eadd3d955110b49d979b38.jpg",
    alt: "banner-1",
  },
  {
    url: "https://7space.sgp1.digitaloceanspaces.com/9I00/1537216201.8ac7594cf67ff140f045244c5e78dea6.jpg",
    alt: "banner-2",
  },
  {
    url: "https://7space.sgp1.digitaloceanspaces.com/9I00/1537216200.cf7a8bef03a6215c34fa03d5d26e047e.jpg",
    alt: "banner-3",
  },
  
];

export default function ContentCarousel() {
  return (
    <section className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/70 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          loop
          speed={700}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="h-[42vh] min-h-[500px] max-h-[520px]"
        >
          {BANNERS.map((it, i) => (
            <SwiperSlide key={it.url}>
              <div className="relative h-full w-full">
                <img
                  src={it.url}
                  alt={it.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  // สไลด์แรกโหลดแบบ eager ให้ขึ้นไวหน่อย
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  sizes="100vw"
                />
                {/* Gradient เคลือบเพื่อโทนหรู */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,.12)_45%,rgba(0,0,0,.50))]" />
                {/* ถ้าไม่อยากมีข้อความ ลบบล็อคนี้ได้เลย */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                  <h2 className="text-white/95 drop-shadow text-2xl sm:text-3xl font-semibold">
                    ยินดีต้อนรับสู่เว็ปไซต์ DeeYing System
                  </h2>
                  <p className="text-white/80 mt-1 text-sm sm:text-base max-w-xl">
                    พวกเรามุ่งมั่นสู่ความเป็นผู้นำในธุรกิจ การผลิต จำหน่าย และบริการเครื่องชั่งน้ำหนักและงานวิศวกรรมที่เกี่ยวข้อง
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* สไตล์จุด pagination โทน Apple */}
      <style>{`
        .swiper-pagination-bullets { bottom: 14px !important; }
        .swiper-pagination-bullet {
          width: 9px; height: 9px;
          background: rgba(255,255,255,.55);
          opacity: 1;
          border: 1px solid rgba(255,255,255,.8);
          transition: transform .2s ease, background .2s ease;
        }
        .swiper-pagination-bullet-active {
          background: #fff;
          transform: scale(1.12);
          box-shadow: 0 2px 8px rgba(0,0,0,.15);
        }
      `}</style>
    </section>
  );
}
