"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Trash2, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatMoney } from "@/utils";
import Loading from "../loading";
import Link from "next/link";
import { createPortal } from "react-dom"; // Thêm import createPortal
import ToastNotification from "@/components/toast/ToastNotification";

const Wishlist = () => {
  const { wishlist, handleRemove, handleAddToCart, handleAddAllToCart } =
    useWishlist();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    keyword: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  } | null>(null); // Thêm trạng thái toast
  const itemsPerPage = 5;

  // Tự động ẩn toast sau 3 giây
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleOpenDialog = (id: number) => {
    setSelectedItemId(id);
    setOpenDialog(true);
  };

  const handleConfirmRemove = async () => {
    setOpenDialog(false);
    if (selectedItemId !== null) {
      setLoading(true);
      try {
        await handleRemove(selectedItemId);
        setToast({
          message: "Xóa sản phẩm khỏi danh sách yêu thích thành công!",
          keyword: "SUCCESS",
        });
      } catch (error) {
        console.error("Error removing item:", error);
        setToast({
          message: "Có lỗi xảy ra khi xóa sản phẩm!",
          keyword: "ERROR",
        });
      } finally {
        setLoading(false);
        setSelectedItemId(null);
      }
    }
  };

  const handleAddToCartWithLoading = async (product: any) => {
    setLoading(true);
    try {
      await handleAddToCart(product);
      setToast({
        message: "Thêm sản phẩm vào giỏ hàng thành công!",
        keyword: "SUCCESS",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      setToast({
        message: "Có lỗi xảy ra khi thêm vào giỏ hàng!",
        keyword: "ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCartWithLoading = async () => {
    setLoading(true);
    try {
      await handleAddAllToCart();
      setToast({
        message: "Thêm tất cả sản phẩm vào giỏ hàng thành công!",
        keyword: "SUCCESS",
      });
    } catch (error) {
      console.error("Error adding all to cart:", error);
      setToast({
        message: "Có lỗi xảy ra khi thêm tất cả vào giỏ hàng!",
        keyword: "ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredWishlist = wishlist.filter((item) =>
    item.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWishlist.length / itemsPerPage);
  const paginatedWishlist = filteredWishlist.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white text-gray-900">
      {loading && <Loading />}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center sm:text-left">
          Danh sách sản phẩm yêu thích của bạn
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 p-2 rounded-lg border border-gray-300 bg-white text-gray-900"
          />
          {filteredWishlist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={handleAddAllToCartWithLoading}
                disabled={loading}
                className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white mt-2 sm:mt-0 px-4 py-2 rounded"
              >
                Thêm tất cả vào giỏ hàng
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {wishlist.length === 0 ? (
        <motion.div
          className="flex flex-col items-center text-gray-500 text-sm sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center mb-4">Danh sách yêu thích trống</p>
          <Link href="/products">
            <button className="px-4 py-2 bg-primary text-white rounded-lg">
              Mua sắm ngay
            </button>
          </Link>
        </motion.div>
      ) : filteredWishlist.length === 0 ? (
        <motion.div
          className="flex flex-col items-center text-gray-500 text-sm sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center mb-4">Không tìm thấy sản phẩm</p>
          <Link href="/products">
            <button className="px-4 py-2 bg-primary text-white rounded-lg">
              Tiếp tục mua sắm
            </button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile View - Card Layout */}
          <div className="md:hidden grid gap-4 overflow-hidden">
            {paginatedWishlist.map((item, index) => (
              <motion.div
                key={item.id}
                className="border rounded-lg p-4 bg-gray-50 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex gap-3 overflow-hidden">
                  <Image
                    width={60}
                    height={60}
                    src={item.product.images[0].image_url}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      {formatMoney(
                        Number.parseInt(
                          item.product.discounted_price.toLocaleString()
                        ),
                        "VND"
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleOpenDialog(item.id)}
                    className="p-2 rounded bg-gray-200 hover:bg-gray-300 flex-1"
                    disabled={loading}
                  >
                    <Trash2 size={18} className="text-gray-900 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleAddToCartWithLoading(item.product)}
                    className="p-2 flex-1 flex justify-center items-center text-white rounded bg-primary hover:bg-primary-light"
                    disabled={loading}
                  >
                    <ShoppingCart size={18} className="text-white" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tablet and Desktop View - Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-primary">
                <tr>
                  <th className="text-white font-bold p-4 text-left min-w-[200px]">
                    Sản phẩm
                  </th>
                  <th className="text-white font-bold p-4 text-left min-w-[100px]">
                    Giá
                  </th>
                  <th className="text-white font-bold p-4 text-left min-w-[150px]">
                    Thời gian thêm
                  </th>
                  <th className="text-white font-bold p-4 text-center min-w-[150px]">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="overflow-hidden">
                {paginatedWishlist.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors align-middle overflow-hidden"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <Image
                        width={60}
                        height={60}
                        src={item.product.images[0].image_url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      />
                      <span className="font-semibold text-gray-900">
                        {item.product.name}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {formatMoney(
                        Number.parseInt(
                          item.product.discounted_price.toLocaleString()
                        ),
                        "VND"
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </td>
                    <td className="p-4 flex flex-row items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenDialog(item.id)}
                        className="p-2 rounded bg-gray-200 hover:bg-gray-300"
                        disabled={loading}
                      >
                        <Trash2 size={18} className="text-gray-900" />
                      </button>
                      <button
                        onClick={() => handleAddToCartWithLoading(item.product)}
                        className="p-2 w-[70%] flex justify-center items-center text-white rounded bg-primary hover:bg-primary-light"
                        disabled={loading}
                      >
                        <ShoppingCart size={18} className="text-white" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {filteredWishlist.length > itemsPerPage && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`}
              disabled={loading}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xs p-4">
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">
              Xác nhận xóa
            </h3>
            <p className="text-sm sm:text-base text-gray-900 mb-4">
              Bạn có chắc chắn muốn xóa sản phẩm này khỏi Wishlist?
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setOpenDialog(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRemove}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={loading}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị toast bằng createPortal */}
      {toast &&
        createPortal(
          <ToastNotification message={toast.message} keyword={toast.keyword} />,
          document.body
        )}
    </div>
  );
};

export default Wishlist;