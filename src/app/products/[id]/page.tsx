import React from "react";
import api from "@/api";
import { Product } from "@/types";
import Loading from "../../loading";
import ProductDetailPage from "./ProductDetail";
import { generateMetadata as generateMeta } from "@/utils";
import { redirect } from "next/navigation";
import Link from "next/link";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props) {
  const storeDetail = await api.products.getDetail(params.id);
  return generateMeta(
    storeDetail?.name || "Product Detail",
    "To product detail information"
  );
}

export default async function Page({ params }: Props) {
  let loading = true;

  try {
    const product: Product | null = await api.products.getDetail(params.id);
    loading = false;

    if (product) {
      return <ProductDetailPage product={product} loadingProps={loading} />;
    }

    // Nếu sản phẩm không tồn tại, hiển thị thông báo "Product Not Found"
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
        <p className="text-gray-500">
          Sản phẩm bạn đang tìm kiếm không tồn tại.
        </p>
        <Link href="/products">
          <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition">
            Quay lại trang sản phẩm
          </button>
        </Link>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return redirect("/error");
  }
}
