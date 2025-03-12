"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Image2 from "../../assets/images/auth/registerImage.png";
import Image1 from "../../assets/images/auth/loginImage.png";
import IconComputer from "../../assets/icons/computerIcon.png";
import IconProgess from "../../assets/icons/Progress circle.png";
import IconStore from "../../assets/icons/IconStore.png";
import bgIcon from "../../assets/images/auth/bg-circle.png";
import IconSafe from "../../assets/icons/IconSafe.png";
import IconSaveMoney from "../../assets/icons/Briefcase.png";
import IconIdea from "../../assets/icons/idea.png";
import ProductCategories from "@/components/homeSection/ProductCategories";
import Products from "@/components/homeSection/Products";
import PromoBanner from "@/components/banner/PromoBanner";
import ValuesSection from "@/components/homeSection/ValuesSection";
import FoundersSection from "@/components/homeSection/FoundersSection";
import BenefitsSection from "@/components/homeSection/BenefitsSection";
import { Category, Product } from "@/types";
import HomeMapSecsion from "@/components/map/Map";
import Link from "next/link";
type HomeType = {
  listCategories: Category[];
  listProducts: Product[];
  loadingProps: boolean;
};
export default function Home({
  listCategories,
  listProducts,
  loadingProps,
}: HomeType) {
  const [categories] = useState<Category[]>(listCategories);
  const [loading, setLoading] = useState<boolean>(loadingProps);
  const [products, setProducts] = useState<Product[]>(listProducts);
  const images = useMemo(() => [Image1.src, Image2.src], []);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 2) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = [latitude, longitude];
          localStorage.setItem("user_location", JSON.stringify(location));
        },
        (error) => {
          console.error("Lỗi khi lấy vị trí:", error);
        }
      );
    } else {
      console.error("Trình duyệt không hỗ trợ Geolocation");
    }
  }, []);

  return (
    <div className="lg:px-20 px-10 h-full w-full overflow-hidden">
      <section className="relative px-4 flex flex-col md:flex-row items-center justify-between h-[600px]">
        {/* Background Icons */}
        <Image
          src={bgIcon.src}
          width={300}
          height={300}
          alt="background login image"
          className="bg-image hidden absolute -left-40 lg:block"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={50}
        />
        <Image
          src={bgIcon.src}
          width={300}
          height={300}
          alt="background login image"
          className="bg-image hidden absolute -right-40 bottom-4 lg:block"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={50}
        />
        {/* Nội dung bên trái */}
        <div className="max-w-xl">
          <h1 className="text-6xl font-bold leading-tight text-gray-900">
            Thu Thập <span className="text-primary">Giảm Giá Tốt</span> Gần Địa
            Điểm Của Bạn
          </h1>
          <p className="mt-4 text-gray-600">
            Khám phá và thu thập những ưu đãi tuyệt vời ngay gần bạn để tiết
            kiệm hơn mỗi ngày!
          </p>
          <div className="mt-6 flex space-x-4">
            <Link href="/products">
              <button className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light">
                Xem sản phẩm
              </button>
            </Link>
            <Link href="/map">
              <button className="px-6 py-3 bg-teal-50 font-semibold rounded-lg hover:bg-teal-100">
                Khám phá các cửa hàng gần bạn
              </button>
            </Link>
          </div>
          <div className="flex p-3 my-4 space-x-6">
            <div className="flex justify-center items-center gap-2">
              <Image
                src={IconSafe.src}
                width={30}
                height={30}
                alt="icon safe"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={70}
              />
              <p>An Toàn</p>
            </div>
            <div className="flex justify-center items-center gap-2">
              <Image
                src={IconSaveMoney.src}
                width={30}
                height={30}
                alt="icon save money"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={70}
              />
              <p>Tiết kiệm</p>
            </div>
            <div className="flex justify-center items-center gap-2">
              <Image
                src={IconIdea.src}
                width={30}
                height={30}
                alt="icon idea"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={50}
              />
              <p>Chất lượng</p>
            </div>
          </div>
        </div>
        {/* Ảnh Slider */}
        <div className="relative w-1/2 h-full overflow-hidden">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex h-full items-center justify-center w-full space-x-4"
          >
            <Image
              src={images[index]}
              alt="Slider image 1"
              width={500}
              height={1000}
              className="w-72 h-[80%] object-cover rounded-lg shadow-md"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={70}
            />
            <Image
              src={images[(index + 1) % images.length]}
              alt="Slider image 2"
              width={500}
              height={1000}
              className="w-72 h-[80%] object-cover rounded-lg shadow-md"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={70}
            />
          </motion.div>
          {/* Box số liệu */}
          <div className="absolute top-20 left-0 space-x-3 bg-white flex items-center shadow-lg p-4 rounded-lg border border-primary">
            <Image
              src={IconComputer.src}
              alt="icon computer for top banner"
              width={50}
              height={50}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={50}
            />
            <div>
              <p className="text-lg font-bold">2K+</p>
              <span className="text-gray-500 text-sm">Khách hàng hài lòng</span>
            </div>
          </div>
          <div className="absolute top-20 right-10 flex flex-col items-center space-y-2 border border-primary bg-white shadow-lg p-4 rounded-lg">
            <Image
              src={IconProgess.src}
              alt="icon computer for top banner"
              width={50}
              height={50}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={50}
            />
            <p className="text-lg font-bold">5K+</p>
            <span className="text-gray-500 text-sm">Sản phẩm</span>
          </div>
          <div className="absolute bottom-20 right-32 space-x-3 bg-white flex items-center shadow-lg p-4 rounded-lg border border-primary">
            <Image
              src={IconStore.src}
              alt="icon computer for top banner"
              width={50}
              height={50}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={50}
            />
            <div>
              <span className="text-gray-500 text-sm">Cửa hàng</span>
              <p className="text-lg font-bold">250+</p>
            </div>
          </div>
        </div>
      </section>
      <section className="relative flex-col md:flex-row items-center justify-between h-auto px-4 hidden lg:block">
        <PromoBanner />
      </section>
      <section className="relative flex flex-col md:flex-row items-center justify-between h-auto">
        <ProductCategories
          categories={categories}
          setProducts={setProducts}
          setLoading={setLoading}
        />
      </section>
      <section className="relative min-h-96 flex flex-col md:flex-row items-start justify-between h-auto px-3">
        {products.length === 0 ? (
          <div className="text-center text-primary">
            Không có sản phẩm nào để hiển thị.
          </div>
        ) : (
          <Products products={products} loading={loading} />
        )}
      </section>

      <section className="relative flex flex-col md:flex-row items-center justify-between h-auto">
        <ValuesSection />
      </section>
      <section className="relative flex flex-col md:flex-row items-center justify-between h-auto bg-red-300">
        <HomeMapSecsion />
      </section>
      <section>
        <FoundersSection />
      </section>
      <section className="relative flex flex-col md:flex-row items-center gap-5 h-auto justify-center">
        <BenefitsSection />
      </section>
    </div>
  );
}
