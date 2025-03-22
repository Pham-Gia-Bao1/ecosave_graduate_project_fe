"use client";
import React, { useState, useEffect, useMemo } from "react";
import { formatMoney } from "@/utils";
import { useRouter } from "next/navigation";
import api from "@/api";
import CheckoutFormGetInfo from "./CheckoutFormGetInfo";
import OrderCard from "./OrderCard";
import { PaymentItem } from "@/types";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import CheckoutStoreInfo from "./CheckoutStoreInfo";
import Image from "next/image";
import bgIcon from "../../assets/images/auth/bg-circle.png";

const CheckoutComponent = ({ products }: { products: PaymentItem[] }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<PaymentItem[]>(products);
  const { user } = useSelector((state: RootState) => state.user);

  // Sử dụng useMemo để tránh tính toán lại không cần thiết
  const totalPrice = useMemo(
    () =>
      selectedItems.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
      ),
    [selectedItems]
  );

  const totalItems = useMemo(() => selectedItems.length, [selectedItems]);

  // Khôi phục từ localStorage khi products rỗng
  useEffect(() => {
    if (products.length === 0 && typeof window !== "undefined") {
      const storedItems = localStorage.getItem("checkoutItems");
      if (storedItems) {
        setSelectedItems(JSON.parse(storedItems));
      }
    } else {
      setSelectedItems(products); // Đồng bộ với props nếu có dữ liệu
    }
  }, [products]);

  // Lưu selectedItems vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    if (typeof window !== "undefined" && totalItems > 0) {
      localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
    }
  }, [selectedItems, totalItems]);

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prevItems) =>
      prevItems.filter((item) => item.id.toString() !== id)
    );
  };

  const handleBuyClick = async () => {
    setLoading(true);
    const orderData = {
      id: Math.floor(10 + Math.random() * 90),
      user_id: user?.id || 1,
      store_id: products[0]?.storeId || selectedItems[0]?.storeId || 1,
      total_price: totalPrice.toFixed(0),
      status: "pending",
      order_date: new Date().toISOString(),
      order_code: `ECOSAVE${Math.floor(
        10000000000 + Math.random() * 90000000000
      )}`,
    };
    document.cookie = `orderData=${encodeURIComponent(
      JSON.stringify(orderData)
    )}; path=/; secure`;
    document.cookie = `orderItems=${encodeURIComponent(
      JSON.stringify(selectedItems)
    )}; path=/; secure`;

    try {
      const URLPayment = await api.payment.create(
        Number(totalPrice.toFixed(0))
      );
      setLoading(false);
      if (URLPayment) {
        router.push(URLPayment);
      }
    } catch (error) {
      console.error("Error during payment:", error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg space-y-6 w-full mx-auto relative">
      <Image
        src={bgIcon.src}
        width={300}
        height={300}
        alt="background login image"
        className="bg-image hidden absolute -left-40 lg:block z-0"
      />
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column for Order Items */}
        <div className="w-full md:w-5/12 gap-6 flex flex-col">
          <CheckoutFormGetInfo />
          {totalItems > 0 && selectedItems[0]?.storeId ? (
            <CheckoutStoreInfo storeId={selectedItems[0].storeId} />
          ) : (
            <p className="text-gray-500">Không có thông tin cửa hàng.</p>
          )}
        </div>
        {/* Right column for Checkout Form */}
        <div className="w-full md:w-7/12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Các sản phẩm của Bạn
          </h2>
          <div className="scrollbar-container gap-3 flex flex-col h-[350px] overflow-auto">
            {totalItems > 0 ? (
              selectedItems.map((item) => (
                <OrderCard
                  key={item.id}
                  id={item.id.toString()}
                  picture={item.picture}
                  name={item.name}
                  price={item.price.toString()}
                  quantity={item.quantity}
                  onRemove={handleRemoveItem}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center">
                Không có sản phẩm nào trong giỏ hàng.
              </p>
            )}
          </div>
          {/* Price Summary */}
          <div className="border p-4 rounded-lg mt-4">
            <div className="flex justify-between text-gray-700">
              <p className="font-semibold">Tạm Tính:</p>
              <p className="font-semibold">{formatMoney(totalPrice)}</p>
            </div>
            <div className="flex justify-between text-gray-800 font-bold">
              <p>Tổng Thanh Toán ({totalItems} Sản phẩm)</p>
              <p className="text-lg text-red-500">
                {totalItems > 0 && totalPrice ? formatMoney(totalPrice) : "0"}
              </p>
            </div>
          </div>
          {/* Checkout Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleBuyClick}
              disabled={totalItems === 0 || loading}
              className={`px-6 py-2 rounded-lg text-white transition-all duration-300 ease-in-out
    ${
      totalItems > 0 && !loading
        ? "bg-primary hover:bg-primary-light active:bg-primary-dark"
        : "bg-gray-300 cursor-not-allowed opacity-70"
    }
    ${loading ? "cursor-wait bg-primary opacity-80" : ""}`}
            >
              {!loading ? "Mua Ngay" : "Đang xử lí..."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutComponent;
