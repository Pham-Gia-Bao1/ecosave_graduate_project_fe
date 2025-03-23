"use client";
import { ProductScan } from "@/types";
import { formatDateTime } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Trash } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import dayjs from "dayjs";
import CountdownTimer from "./CountdownTimer";
import ToastNotification from "@/components/toast/ToastNotification";
import api from "@/api";
import { removeTimeFromDate } from "@/utils/helpers/convertToVietnamTime";

const getDaysDifference = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

const getExpiryColor = (daysRemaining: number) => {
  if (daysRemaining <= 10) return "bg-red-600";
  if (daysRemaining <= 30) return "bg-orange-500";
  return "text-white bg-primary";
};

export const getDaysRemaining = (expiryDate: string): number => {
  const today = dayjs().startOf("day");
  const expiry = dayjs(expiryDate).startOf("day");
  return expiry.diff(today, "day");
};

export default function ExpiryItemsReminder({
  products,
}: {
  products: ProductScan[];
}) {
  const [listProducts, setListProducts] = useState<ProductScan[]>(products);
  const [filter, setFilter] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductScan | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    keyword: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  } | null>(null);

  const filteredProducts = listProducts.filter((product) => {
    const daysRemaining = getDaysDifference(product.expiryDate);
    if (filter === null) return true;
    return daysRemaining <= filter;
  });

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((_id) => _id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProducts(
      selectedProducts.length === filteredProducts.length
        ? []
        : filteredProducts.map((p) => p._id)
    );
  };

  const deleteSelectedProducts = () => {
    setListProducts((prev) =>
      prev.filter((p) => !selectedProducts.includes(p._id))
    );
    setSelectedProducts([]);
  };

  const deleteProduct = async (productId: string) => {
    const isDeleted = await api.products.deleteSaved(productId);
    if (isDeleted) {
      setListProducts((prev) => prev.filter((p) => p._id !== productId));
      setToast({ message: `Đã xóa sản phẩm thành công`, keyword: "SUCCESS" });
    } else {
      setToast({ message: `Không thể xóa sản phẩm`, keyword: "ERROR" });
    }
  };

  return (
    <div className="flex flex-col p-2 w-full mx-auto border gap-2">
      {/* Filter Section - Collapsible on Mobile */}
      <div className="w-full">
        <details className="md:hidden">
          <summary className="text-lg font-semibold mb-2 cursor-pointer">
            Lọc theo thời gian hết hạn
          </summary>
          <ul className="space-y-2 text-gray-700 mt-2">
            {[
              { label: "Tất cả sản phẩm", value: null },
              { label: "Dưới 3 tháng", value: 90 },
              { label: "Dưới 2 tháng", value: 60 },
              { label: "Dưới 1 tháng", value: 30 },
              { label: "Dưới 10 ngày", value: 10 },
              { label: "Hết hạn", value: 0 },
            ].map(({ label, value }) => (
              <li
                key={label}
                className={`cursor-pointer p-2 rounded-md transition ${
                  filter === value ? "bg-gray-300 font-bold" : "hover:bg-gray-200"
                }`}
                onClick={() => setFilter(value)}
              >
                {label}
              </li>
            ))}
          </ul>
        </details>

        {/* Filter for Desktop */}
        <div className="hidden md:block md:w-1/4 md:border-r md:pr-4">
          <h2 className="text-lg font-semibold mb-4">Lọc theo thời gian hết hạn</h2>
          <ul className="space-y-2 text-gray-700">
            {[
              { label: "Tất cả sản phẩm", value: null },
              { label: "Dưới 3 tháng", value: 90 },
              { label: "Dưới 2 tháng", value: 60 },
              { label: "Dưới 1 tháng", value: 30 },
              { label: "Dưới 10 ngày", value: 10 },
              { label: "Hết hạn", value: 0 },
            ].map(({ label, value }) => (
              <li
                key={label}
                className={`cursor-pointer p-2 rounded-md transition ${
                  filter === value ? "bg-gray-300 font-bold" : "hover:bg-gray-200"
                }`}
                onClick={() => setFilter(value)}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Legend */}
        <div className="text-sm text-gray-600 mt-4 flex flex-wrap gap-2">
          <p className="flex items-center">
            <span className="inline-block w-3 h-3 bg-red-600 mr-1"></span> Dưới 10 ngày
          </p>
          <p className="flex items-center">
            <span className="inline-block w-3 h-3 bg-orange-500 mr-1"></span> Dưới 1 tháng
          </p>
          <p className="flex items-center">
            <span className="inline-block w-3 h-3 bg-primary text-white mr-1"></span> Trên 1 tháng
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mt-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg md:text-xl font-semibold">Sản phẩm sắp hết hạn</h2>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={
                selectedProducts.length === filteredProducts.length &&
                filteredProducts.length > 0
              }
              onChange={selectAllProducts}
            />
            <label htmlFor="selectAll" className="cursor-pointer text-sm">
              Chọn tất cả
            </label>
            {selectedProducts.length > 0 && (
              <Trash
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500"
                onClick={deleteSelectedProducts}
              />
            )}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          <AnimatePresence>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const daysRemaining = getDaysDifference(product.expiryDate);
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center py-2 border-b last:border-0 cursor-pointer p-2 rounded-md transition ${
                      selectedProduct?._id === product._id
                        ? "bg-gray-300"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectProduct(product._id);
                      }}
                    />
                    <div className="ml-2 flex-1">
                      <p className="text-xs md:text-sm text-gray-500">
                        Sản phẩm: <span className="font-bold">{product.title}</span>
                      </p>
                      <div className="flex items-center text-xs md:text-sm mt-1 flex-wrap">
                        <Image
                          width={40}
                          height={40}
                          src={product.images[0]}
                          alt="icon"
                          className="w-5 h-5 md:w-6 md:h-6 rounded-full mr-2"
                        />
                        <span className="font-bold">Hạn sử dụng:</span>
                        <span
                          className={`ml-1 p-1 rounded text-white text-xs ${getExpiryColor(
                            daysRemaining
                          )}`}
                        >
                          {removeTimeFromDate(formatDateTime(product.expiryDate))}
                        </span>
                        <span className="font-bold pl-2">
                          {getDaysRemaining(product.expiryDate) > 0
                            ? `Còn ${getDaysRemaining(product.expiryDate)} ngày`
                            : "Đã hết hạn"}
                        </span>
                      </div>
                    </div>
                    <Trash
                      className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProduct(product._id);
                      }}
                    />
                  </motion.div>
                );
              })
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-500 mt-4"
              >
                Không có sản phẩm nào.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Product - Collapsible on Mobile */}
      <div className="w-full mt-4">
        <details className="md:hidden">
          <summary className="text-lg font-semibold cursor-pointer">
            Chi tiết sản phẩm
          </summary>
          {selectedProduct ? (
            <motion.div
              key={selectedProduct._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-2"
            >
              <div className="w-full h-40 bg-gray-300 rounded-md flex items-center justify-center">
                <Image
                  width={150}
                  height={150}
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
              <p className="font-bold mt-2 text-sm">Tên sản phẩm</p>
              <p className="text-gray-700 text-sm">{selectedProduct.title}</p>
              <p className="font-bold mt-2 text-sm">Ngày hết hạn</p>
              <p
                className={`p-2 rounded mt-1 text-white text-sm ${getExpiryColor(
                  getDaysDifference(selectedProduct.expiryDate)
                )}`}
              >
                {removeTimeFromDate(formatDateTime(selectedProduct.expiryDate))}
              </p>
              <p className="font-bold mt-2 text-sm">Ngày lưu sản phẩm</p>
              <p className="text-gray-700 text-sm">
                {removeTimeFromDate(formatDateTime(selectedProduct.meta?.createdAt ?? ""))}
              </p>
              <CountdownTimer expiryDate={selectedProduct.expiryDate} />
            </motion.div>
          ) : (
            <p className="text-gray-500 text-sm mt-2">Chọn một sản phẩm để xem chi tiết</p>
          )}
        </details>

        {/* Detail for Desktop */}
        <div className="hidden md:block md:w-1/4 md:border-l md:pl-4">
          <h2 className="text-xl font-semibold">Chi tiết sản phẩm</h2>
          {selectedProduct ? (
            <motion.div
              key={selectedProduct._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full h-auto bg-gray-300 mt-2 flex items-center justify-center rounded-md">
                <Image
                  width={200}
                  height={400}
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
              <p className="font-bold mt-2">Tên sản phẩm</p>
              <p className="text-gray-700">{selectedProduct.title}</p>
              <p className="font-bold mt-2">Ngày hết hạn</p>
              <p
                className={`p-2 rounded mt-3 text-white ${getExpiryColor(
                  getDaysDifference(selectedProduct.expiryDate)
                )}`}
              >
                {removeTimeFromDate(formatDateTime(selectedProduct.expiryDate))}
              </p>
              <p className="font-bold mt-2">Ngày lưu sản phẩm</p>
              <p className="text-gray-700">
                {removeTimeFromDate(formatDateTime(selectedProduct.meta?.createdAt ?? ""))}
              </p>
              <CountdownTimer expiryDate={selectedProduct.expiryDate} />
            </motion.div>
          ) : (
            <p className="text-gray-500">Chọn một sản phẩm để xem chi tiết</p>
          )}
        </div>
      </div>

      {toast && (
        <ToastNotification message={toast.message} keyword={toast.keyword} />
      )}
    </div>
  );
}