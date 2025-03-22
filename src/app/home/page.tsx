import React, { Suspense } from "react";
import Home from "./Home";
import api from "@/api";
import { Category, Product } from "@/types";
import Loading from "../loading";

const HomePage = async () => {
  try {
    const page = 1;
    const [products, categories]: [Product[], Category[]] = await Promise.all([
      api.products.getList({ page }),
      api.categories.getList(),
    ]);

    return (
      <Suspense fallback={<Loading />}>
        <Home listCategories={categories} listProducts={products} loadingProps={false} />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return <div className="text-center text-orange-500">Lỗi khi lấy dữ liệu. Vui lòng thử lại sau.</div>;
  }
};

export default HomePage;
