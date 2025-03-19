import React, { Suspense } from "react";
import StorePage from "./Store";
import Loading from "@/app/loading";
import { Product, Store, Category } from "@/types";
import { getCategories, getProducts, getStoreById } from "@/api";
import { generateMetadata as generateMeta } from "@/utils";

type Props = {
  params: { storeId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props) {
  try {
    const storeDetail = await getStoreById(Number(params.storeId));
    return generateMeta(
      storeDetail?.store_name || "Store",
      "To see all available nearing stores that contain experiential promotional information"
    );
  } catch (error) {
    console.error("Error generating metadata:", error);
    return generateMeta("Store", "Default store description");
  }
}

export default async function StoreDetailPage({ params }: Props) {
  const { storeId } = params;
  let storeDetail: Store | null = null;
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const [storeData, productData, categoryData] = await Promise.all([
      getStoreById(Number(storeId)),
      getProducts({ store_id: Number(storeId) }),
      getCategories(),
    ]);

    storeDetail = storeData;
    products = productData || [];
    categories = categoryData || [];
  } catch (error) {
    console.error("Failed to fetch store data:", error);
    return (
      <div className="text-center text-orange-500">
        Lỗi khi lấy dữ liệu. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex justify-center items-center bg-green-400">
        {storeDetail ? (
          <StorePage store={storeDetail} products={products} categories={categories} />
        ) : (
          <p>Không tìm thấy cửa hàng.</p>
        )}
      </div>
    </Suspense>
  );
}
