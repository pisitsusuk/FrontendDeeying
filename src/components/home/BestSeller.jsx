import React, { useEffect, useState } from "react";
import { listProductBy } from "../../api/product";
import SwiperShowProduct from "../../utils/SwiperShowProduct";
import { SwiperSlide } from "swiper/react";
import AppleProductCard from "../card/AppleAccessoryCard";

const BestSeller = () => {
  const [data, setData] = useState([]);

  useEffect(() => { loadData(); }, []);
  const loadData = () => {
    listProductBy("sold", "desc", 12)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  };

  return (
    <SwiperShowProduct title="สินค้าขายดี">
      {data?.map((item, index) => (
        <SwiperSlide key={item?.id ?? item?._id ?? index}>
          <AppleProductCard item={item} />
        </SwiperSlide>
      ))}
    </SwiperShowProduct>
  );
};

export default BestSeller;
