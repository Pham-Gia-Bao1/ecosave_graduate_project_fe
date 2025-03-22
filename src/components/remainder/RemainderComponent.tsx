import api from "@/api";
import { getProductsByIds } from "@/api/scan";
import { ProductScan, UserProfile } from "@/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { useDispatch } from "react-redux";
import { addNotifications } from "@/redux/notificationSlice";
import { motion } from "framer-motion"; // Import framer-motion

type RemainderType = {
  currentDate: string;
  user: UserProfile | null;
};

// Hàm định dạng chỉ ngày (không giờ)
const formatDateOnly = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Variants cho animation từ phải sang trái
const itemVariants = {
  hidden: { x: 100, opacity: 0 }, // Bắt đầu từ bên phải (x: 100) và ẩn
  visible: (i: number) => ({
    x: 0, // Di chuyển về vị trí ban đầu
    opacity: 1,
    transition: {
      delay: i * 0.1, // Delay tăng dần cho từng item
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  }),
};

export default function RemainderComponent({
  currentDate,
  user,
}: RemainderType) {
  const [products, setProducts] = useState<ProductScan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      api.products.getSaved(user.id)
        .then((productIds) =>
          productIds ? getProductsByIds(productIds) : null
        )
        .then((products) => {
          if (products) {
            setProducts(products);
            dispatch(addNotifications(products.length));
          }
        })
        .catch((error) => console.error("API Error:", error))
        .finally(() => setLoading(false));
    }
  }, [user, currentDate]);

  // Xóa sản phẩm khỏi UI & sessionStorage
  const handleDelete = (productId: string) => {
    if (!user?.id) return;
    const cacheKey = `save_products_${user.id}`;
    const storedData = sessionStorage.getItem(cacheKey);

    if (storedData) {
      try {
        const productIds = JSON.parse(storedData) as string[];

        if (!Array.isArray(productIds)) {
          console.error("Invalid session storage format:", productIds);
          return;
        }

        const updatedProductIds = productIds.filter((id) => id !== productId);

        if (updatedProductIds.length > 0) {
          sessionStorage.setItem(cacheKey, JSON.stringify(updatedProductIds));
        } else {
          sessionStorage.removeItem(cacheKey);
        }
      } catch (error) {
        console.error("Error parsing session storage:", error);
      }
    }

    setProducts((prevProducts) =>
      prevProducts.filter((product) => product._id !== productId)
    );
  };

  // Hàm tính số ngày còn lại trước khi hết hạn
  const getDaysRemaining = (expiryDate: string) => {
    const current = new Date(currentDate);
    const expiry = new Date(expiryDate);
    return Math.ceil(
      (expiry.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">Không có sản phẩm nào.</p>
      ) : (
        <div className="flex flex-col">
          {products.map((product, index) => {
            const daysRemaining = getDaysRemaining(product.expiryDate);

            return (
              <motion.div
                key={product._id}
                custom={index} // Truyền index để tạo delay tăng dần
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                className="flex flex-col p-4 mt-2 bg-white border rounded"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      width={40}
                      height={40}
                      src={product.images[0]}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="text-primary font-semibold">
                        {product.title}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Sắp hết hạn{" "}
                        <span className="text-primary font-semibold">
                          {daysRemaining} ngày nữa
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 transition"
                    aria-label="Xóa sản phẩm"
                  >
                    <Trash size={20} />
                  </button>
                </div>
                <p className="text-gray-700 text-sm mt-2">
                  👉 Hãy sử dụng trước
                  <span className="font-semibold">
                    {formatDateOnly(product.expiryDate)}
                  </span>
                  để đảm bảo chất lượng tốt nhất.
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}