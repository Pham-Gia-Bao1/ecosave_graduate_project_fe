"use client";

import { useState, useEffect } from "react";
import { getAccessToken } from "@/utils/helpers/getAccessToken";
import { useRouter } from "next/navigation";
import ExpiryItemsReminder from "./ExpiryItemsReminder";
import { ProductScan } from "@/types";
import { getProductsByIds } from "@/api/scan";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { getSaveProductOfUser } from "@/api";
import Loading from "../loading";

export default function ExpiryPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [products, setProducts] = useState<ProductScan[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log(user?.id)
    if (user?.id) {
      setLoading(true);
      getSaveProductOfUser(user.id)
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
      <h1 className="text-xl font-bold">Các sản phẩm đã lưu để nhắc nhở</h1>
      {loading && <Loading />}
      {!loading && products && <ExpiryItemsReminder products={products} />}
      {!loading && !products && <p>Không tìm thấy sản phẩm đã lưu</p>}
    </div>
  );
}
