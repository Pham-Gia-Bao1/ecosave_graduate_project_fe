"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ExpiryItemsReminder from "./ExpiryItemsReminder";
import { ProductScan } from "@/types";
import { getProductsByIds } from "@/api/scan";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import api from "@/api";
import Loading from "../loading";
import { AiOutlineInbox } from "react-icons/ai";

export default function ExpiryPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [products, setProducts] = useState<ProductScan[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log(user?.id);
    if (user?.id) {
      setLoading(true);
      api.products.getSavedAll(user.id)
        .then((productIds) => {
          console.log("Saved product IDs:", productIds);
          return productIds ? getProductsByIds(productIds) : null;
        })
        .then((products) => {
          console.log("Fetched products:", products);
          if (products) {
            setProducts(products);
          }
        })
        .catch((error) => console.error("API Error:", error))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, router]); // Removed dispatch from dependencies since it's not used.

  return (
    <div className="p-6 flex flex-col gap-3">
       <h1 className="text-2xl font-bold mb-8 text-center">Các sản phẩm đã lưu để nhắc nhở</h1>
      {loading && <Loading />}
      {!loading && products && <ExpiryItemsReminder products={products} />}
      {!loading && (!products || products.length === 0) && (
        <div className="flex flex-col items-center justify-center h-60 text-gray-500">
          <AiOutlineInbox className="text-5xl mb-2" />
          <p className="text-lg font-medium">Không tìm thấy sản phẩm đã lưu</p>
          <span className="text-sm">
            Hãy thêm sản phẩm vào danh sách lưu để theo dõi nhé!
          </span>
        </div>
      )}
    </div>
  );
}
