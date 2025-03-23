"use client";
import Image from "next/image";
import Products from "@/components/homeSection/Products";
import { useEffect, useState } from "react";
import FilterSidebar from "@/components/filer/FilterSidebar";
import { Category, Product } from "@/types";
import SliderHeaderMobile from "@/components/banner/SliderHeaderMobile";
const banners = [
  "https://www.bigc.vn/files/omni-banner-31-07-2023-14-47-58/march-26-02-2025-14-35-48/13-03-24-03-mega-sale-go-tu-n-l-v-ng-sale-r-nh-rang-adapt-banner-website-1486x692.png",
  "https://www.bigc.vn/files/omni-banner-31-07-2023-14-47-58/jan-2025-02-01-2025-14-52-32/09-01-22-01-mega-sale-c-ng-go-s-m-t-t-y-blog-cover-1080x540-bigc.png",
  "https://www.bigc.vn/files/omni-banner-31-07-2023-14-47-58/march-26-02-2025-14-35-48/blog-cover-1080-x-540-big-c-1.png",
];

const slides1 = [
  "https://www.bigc.vn/files/a-31-08-2023-11-41-07/09-20-03-ng-y-h-i-n-ng-s-n-l-tb-1080big.jpg",
  "https://www.bigc.vn/files/omni-banner-31-07-2023-14-47-58/jan-2025-02-01-2025-14-52-32/09-01-22-01-mega-sale-c-ng-go-s-m-t-t-y-blog-cover-1080x540-bigc.png",
  "https://www.bigc.vn/files/omni-banner-31-07-2023-14-47-58/january-2024-05-01-2024-17-52-54/bd-ulv-omo-blog-cover-article-bigc-1080-x-540.jpg",
];
const slides2 = [
  "https://www.bigc.vn/files/omni-banner-31-07-2023-14-47-58/jan-2025-02-01-2025-14-52-32/09-01-22-01-mega-sale-c-ng-go-s-m-t-t-y-blog-cover-1080x540-bigc.png",
  "https://www.bigc.vn/files/omni-banner-31-07-2023-14-47-58/january-2024-05-01-2024-17-52-54/bd-ulv-omo-blog-cover-article-bigc-1080-x-540.jpg",
  "https://www.bigc.vn/files/omni-banner-31-07-2023-14-47-58/march-26-02-2025-14-35-48/28-02-10-03-mega-sale-u-i-ng-t-ng-o-m-ng-8-3-2-blog-cover-bigc-1080x540.png",
];
type ProductListingProps = {
  listProducts: Product[];
  loadingProps: boolean;
  listCategories: Category[];
  IS_BANNER?: boolean;
};
export default function ProductListing({
  listProducts,
  loadingProps,
  listCategories,
  IS_BANNER = true,
}: ProductListingProps) {
  const [products, setProducts] = useState<Product[]>(listProducts);
  const [categories] = useState<Category[]>(listCategories);
  const [loading, setLoading] = useState<boolean>(loadingProps);
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="container mx-auto py-8 mw-[100%]">
      {IS_BANNER && (
        <div className="lg:h-[450px] w-full flex justify-between items-center gap-5">
          <div className="hidden lg:block w-[70%] h-full relative bg-red-300">
            {banners.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`Banner Image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className={`absolute transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
                onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
              />
            ))}
          </div>
          <div className="lg:w-[30%] w-full gap-3 h-full flex flex-col justify-center items-center">
            <div className="w-full h-1/2 bg-red-400"><SliderHeaderMobile slides={slides1} /></div>
            <div className="w-full hidden lg:block h-1/2 bg-red-400"><SliderHeaderMobile slides={slides2} /></div>
          </div>
        </div>
      )}
      {/* Bố cục chính */}
      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Sidebar bộ lọc */}
        <FilterSidebar
          setProducts={setProducts}
          allProducts={products}
          categories={categories}
          setLoading={setLoading}
        />
        {/* Danh sách sản phẩm */}
        <main className="flex-1 flex-wrap w-full">
          <Products
            className="lg:grid-cols-4"
            products={products}
            loading={loading}
            ITEMS_PER_PAGE={8}
          />
        </main>
      </div>
    </div>
  );
}
