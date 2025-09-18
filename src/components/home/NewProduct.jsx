import React, { useEffect, useState } from "react";
import { listProductBy } from "../../api/product";
import SwiperShowProduct from "../../utils/SwiperShowProduct";
import { SwiperSlide } from "swiper/react";
import AppleProductCard from "../card/AppleAccessoryCard";

const NewProduct = () => {
  const [data, setData] = useState([]);

  useEffect(() => { loadData(); }, []);
  const loadData = () => {
    listProductBy("updatedAt", "desc", 12)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  };

  return (
    <SwiperShowProduct title="สินค้าใหม่">
      {data?.map((item, index) => (
        <SwiperSlide key={item?.id ?? item?._id ?? index}>
          <AppleProductCard item={item} />
        </SwiperSlide>
      ))}
    </SwiperShowProduct>
  );
};

export default NewProduct;
