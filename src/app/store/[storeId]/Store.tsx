"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import ProductListing from "@/app/products/Products";
import ValuesSection from "@/components/homeSection/ValuesSection";
import { Category, Product, Store } from "@/types";
import bgIcon from "../../../assets/images/auth/bg-circle.png";
import TestimonialSlider from "./TestimonialSlider";
import { useUserLocation } from "@/hooks/useUserLocation";
import calculateDistance from "@/utils/calculateDistance";
import Direction from "@/app/map/direction/Direction";

interface StorePageProps {
  store: Store;
  products: Product[];
  categories: Category[];
}

const StorePage: React.FC<StorePageProps> = ({
  store,
  products,
  categories,
}) => {
  const userLocation = useUserLocation();
  const [isOpenDirection, setIsOpenDirection] = useState<boolean>(false);
  const [direction, setDirection] = useState<[number, number] | null>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const benefitItem = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const openDirection = () => {
    // Handle case where userLocation isn't available
    if (typeof window !== "undefined") {
      const location = localStorage.getItem("user_location");
      if (location) {
        try {
          const parsedLocation = JSON.parse(location);
          setDirection(parsedLocation);
          setIsOpenDirection((prev) => !prev);
        } catch (error) {
          console.error("Error parsing user_location:", error);
        }
      }
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-white font-sans">
        <motion.section
          className="relative w-full h-[650px] bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0">
            <Image
              src={store.avatar || "/default-banner.jpg"}
              alt="Store Banner"
              layout="fill"
              objectFit="cover"
              className="w-full h-full opacity-80"
            />
            <div className="absolute inset-0 bg-black opacity-30"></div>
          </div>

          <motion.div
            className="relative -top-11 flex flex-col items-center justify-center h-full text-center text-white"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <motion.div
              className="mb-4 flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src={store.logo || "/fallback-logo.png"}
                alt="Store Logo"
                width={200}
                height={200}
                className="rounded border-4 border-white shadow-md"
              />
              <div className="flex justify-center items-center gap-1  text-white px-2 py-1 mt-2 rounded">
                {store.status === "active" ? (
                  <p className="text-sm bg-green-500 p-2 rounded">
                    Đang mở cửa
                  </p>
                ) : (
                  <p className="text-sm bg-red-500 p-2 rounded">Đóng cửa</p>
                )}
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-wide uppercase">
              {store.store_name || "FRESH GROCERY"}
            </h1>

            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
              {store.soft_description}
            </p>
          </motion.div>
        </motion.section>

        {/* Rest of the sections remain the same */}
        <motion.section
          className="relative -top-32 bg-white shadow-lg rounded-lg max-w-6xl mx-auto -mt-12 p-6 flex flex-col md:flex-row justify-around items-center gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {[
            { icon: "📧", title: "Email", text: store.contact_email },
            { icon: "⏰", title: "Giờ hoạt động", text: store.opening_hours },
            { icon: "📍", title: "Địa chỉ", text: store.address },
            { icon: "📞", title: "Số điện thoại", text: store.contact_phone },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              variants={benefitItem}
              whileHover={{ y: -5 }}
            >
              <div className="text-3xl text-gray-600 mb-2">{item.icon}</div>
              <h4 className="text-sm font-semibold text-gray-800">
                {item.title}
              </h4>
              <p className="text-xs text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </motion.section>


        <section className="lg:px-28 px-3 relative -mt-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src={bgIcon.src}
              width={300}
              height={300}
              alt="background login image"
              className="bg-image hidden absolute -left-52 lg:block"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={50}
            />
            <Image
              src={bgIcon.src}
              width={300}
              height={300}
              alt="background login image"
              className="bg-image hidden absolute top-72 -left-52 lg:block"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={50}
            />

            <ProductListing
              IS_BANNER={false}
              loadingProps={false}
              listProducts={products}
              listCategories={categories}
            />
          </motion.div>
        </section>

        <section className="lg:px-28 px-3 bg-white -mt-7 flex justify-center items-center gap-4 flex-col">
          <h1 className="text-2xl font-bold">
            Khoảng cách với vị trí của bạn là
            {userLocation
              ? (() => {
                  const distance = calculateDistance(
                    [store.latitude, store.longitude],
                    userLocation
                  );

                  if (isNaN(distance)) return "Lỗi tính toán khoảng cách";

                  return distance < 1
                    ? `${(distance * 1000).toFixed(0)}m `
                    : `${distance.toFixed(2)} km `;
                })()
              : "Đang xác định khoảng cách"}
          </h1>
          <button
            onClick={openDirection}
            className="bg-white text-primary px-6 py-3 rounded-full font-semibold text-lg
              hover:bg-red-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Xem đường đi
          </button>
          {direction && isOpenDirection && (
            <div className="bg-gray-300 w-full h-[300px]">
              <Direction
                origin={`${direction[0]},${direction[1]}`}
                destination={`${store.latitude},${store.longitude}`}
              />
            </div>
          )}
        </section>

        <motion.section
          className="relative flex flex-col md:flex-row items-center justify-between h-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <ValuesSection />
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <TestimonialSlider />
        </motion.section>
      </div>
    </>
  );
};

export default StorePage;
