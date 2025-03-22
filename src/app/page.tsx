import { generateMetadata } from "@/utils";
import React, { Suspense } from "react";
import api from "@/api";
import { Category, Product } from "@/types";

export const metadata = generateMetadata(
  "",
  "Welcome to LayRestaurant, the best platform for booking food and rooms"
);

import Home from "./home/Home";
import Loading from "./loading";

export default async function HomePage() {
  const page = 1; // Có thể lấy từ URL hoặc props nếu cần
  let products: Product[] | [] = [];
  let categories: Category[] | [] = [];

  try {
    // Gọi cả hai API đồng thời
    const [productsData, categoriesData] = await Promise.all([
      api.products.getList({ page }),
      api.categories.getList(),
    ]);

    products = productsData;
    categories = categoriesData;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return (
      <div className="text-center text-orange-500">
        Lỗi khi lấy dữ liệu. Vui lòng thử lại sau.
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center text-primary">
        Không có sản phẩm nào để hiển thị.
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-screen">
        <Home listCategories={categories} listProducts={products} loadingProps={false} />
      </div>
    </Suspense>
  );
}
