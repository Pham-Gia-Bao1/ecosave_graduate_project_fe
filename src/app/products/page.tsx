import React, { Suspense } from "react";
import api from "@/api";
import { Category, Product } from "@/types";
import Loading from "../loading";
import ProductListing from "./Products";
export default async function Page() {
  const page = 1; // Có thể lấy từ URL hoặc props nếu cần
  let products: Product[] | null = null;
  let categories: Category[] | null = null;
  let loading = true;
  try {
    products = await api.products.getList({page});
    categories = await api.categories.getList();
    loading = false;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return (
      <div className="text-center text-orange-500">
        Lỗi khi lấy dữ liệu. Vui lòng thử lại sau
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
      <div className="px-10">
        <ProductListing loadingProps={loading} listProducts={products} listCategories={categories} />
      </div>
    </Suspense>
  );
}
