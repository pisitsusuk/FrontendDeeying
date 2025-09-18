// src/components/search/SearchCard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Range } from "react-range";
import useEcomStore from "../../store/ecom-store";

const MIN_PRICE = 0;
const MAX_PRICE = 200000;
const STEP = 100;

export default function SearchCard() {
  const actionSearchFilters = useEcomStore((s) => s.actionSearchFilters);
  const getProduct = useEcomStore((s) => s.getProduct);
  const categories = useEcomStore((s) => s.categories);
  const getCategory = useEcomStore((s) => s.getCategory);

  // UI states
  const [query, setQuery] = useState("");
  const [selectedCats, setSelectedCats] = useState([]); // number[]
  const [price, setPrice] = useState([1000, 200000]); // [min, max]

  // โหลดหมวดหมู่รอบแรก (ถ้ายังไม่มี)
  useEffect(() => {
    if (!categories || categories.length === 0) {
      getCategory?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // payload ที่พร้อมส่งทุกครั้งที่ state เปลี่ยน
  const payload = useMemo(() => {
    const q = (query || "").trim();
    const categoryIds = (selectedCats || [])
      .map((id) => Number(id))
      .filter(Boolean);

    const [minPrice, maxPrice] =
      Array.isArray(price) && price.length === 2
        ? [Number(price[0]) || 0, Number(price[1]) || 0]
        : [null, null];

    return { query: q, categoryIds, minPrice, maxPrice };
  }, [query, selectedCats, price]);

  // debounce ยิงค้นหาเมื่อมี payload เปลี่ยน
  const timerRef = useRef(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const noFilter =
        !payload.query &&
        (!payload.categoryIds || payload.categoryIds.length === 0) &&
        (!payload.minPrice && !payload.maxPrice);

      if (noFilter) getProduct?.();
      else actionSearchFilters?.(payload);
    }, 300);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  // เปลี่ยนสถานะ checkbox ของหมวดหมู่
  const toggleCat = (id) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ล้างทั้งหมด
  const clearAll = () => {
    setQuery("");
    setSelectedCats([]);
    setPrice([1000, 30000]);
    getProduct?.();
  };

  // คำนวณเปอร์เซ็นต์ของหัวสไลเดอร์ เพื่อทาแถบสีระหว่าง min-max
  const percent = (v) => ((v - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-5 md:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold tracking-tight text-neutral-900">
          ค้นหาสินค้า
        </h2>
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-neutral-500 hover:text-neutral-900 underline decoration-neutral-300 underline-offset-4"
        >
          ล้างตัวกรอง
        </button>
      </div>

      {/* คำค้น */}
      <div className="relative mb-4">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13.442 12.025a6 6 0 11.707-.707l3.766 3.767a.5.5 0 01-.707.707l-3.766-3.767zM8.5 14a5.5 5.5 0 100-11 5.5 5.5 0 000 11z" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาสินค้า..."
          className="w-full rounded-xl border border-neutral-200 bg-white px-10 py-2.5 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
        />
      </div>

      {/* หมวดหมู่ */}
      <div className="mb-5">
        <div className="mb-2 text-[15px] font-medium text-neutral-900">
          หมวดหมู่สินค้า
        </div>

        <div className="flex flex-wrap gap-2">
          {(categories || []).map((c) => {
            const checked = selectedCats.includes(c.id);
            return (
              <label
                key={c.id}
                className={[
                  "cursor-pointer select-none rounded-full border px-3 py-1.5 text-sm transition",
                  checked
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400",
                ].join(" ")}
                title={c.name || c.title || `หมวด ${c.id}`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleCat(c.id)}
                  aria-label={`เลือกหมวด ${c.name || c.title || c.id}`}
                />
                <span>{c.name || c.title || `หมวด ${c.id}`}</span>
              </label>
            );
          })}

          {(!categories || categories.length === 0) && (
            <div className="text-xs text-neutral-500">ไม่มีหมวดหมู่</div>
          )}
        </div>
      </div>

      {/* ราคา: Range Slider สองหัว */}
      <div>
        <div className="mb-2 text-[15px] font-medium text-neutral-900">
          ช่วงราคา (บาท)
        </div>

        <div className="py-3">
          <Range
            values={price}
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={STEP}
            onChange={(values) => setPrice(values)}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                className="h-2 w-full rounded-full"
                style={{
                  ...props.style,
                  background: `linear-gradient(
                    to right,
                    #e5e7eb 0%,
                    #e5e7eb ${percent(price[0])}%,
                    #0b0b0f ${percent(price[0])}%,
                    #0b0b0f ${percent(price[1])}%,
                    #e5e7eb ${percent(price[1])}%,
                    #e5e7eb 100%
                  )`,
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props, isDragged }) => (
              <div
                {...props}
                className="grid h-5 w-5 -mt-1 place-items-center rounded-full border border-neutral-300 bg-white shadow-md"
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    isDragged ? "bg-neutral-900" : "bg-neutral-700"
                  }`}
                />
              </div>
            )}
          />
          <div className="mt-2 flex justify-between text-sm text-neutral-700 tabular-nums">
            <span>{price[0].toLocaleString()} บาท</span>
            <span>{price[1].toLocaleString()} บาท</span>
          </div>
        </div>
      </div>
    </section>
  );
}
