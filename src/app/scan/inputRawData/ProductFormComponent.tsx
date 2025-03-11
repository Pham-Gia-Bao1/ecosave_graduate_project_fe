"use client";

import { getUrlUpdateUserImg } from "@/utils";
import Image from "next/image";
import { useState, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineClose } from "react-icons/ai";
import { motion } from "framer-motion";
import LOGO from "../../../assets/images/logo/LOGO.png";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ToastNotification from "@/components/toast/ToastNotification";
import { storeSaveProductToReceiptNotification } from "@/api";

// Định nghĩa interface ngoài component để tránh re-create
interface ProductForm {
  _id: string;
  title: string;
  expiryDate: string;
  productImages: FileList;
}

// Memoized Product Display component
const ProductDisplay = memo(({ product, onReset }: {
  product: ProductForm;
  onReset: () => void
}) => (
  <div className="text-center">
    <h2 className="text-2xl font-bold text-green-600">Sản phẩm đã lưu thành công!</h2>
    <p className="text-gray-700">Tiêu đề: <strong>{product.title}</strong></p>
    <p className="text-gray-700">Hạn sử dụng: <strong>{product.expiryDate}</strong></p>
    <div className="flex justify-center gap-2 mt-4">
      {product.productImages && Array.from(product.productImages).map((file, index) => (
        <Image
          key={index}
          src={URL.createObjectURL(file)}
          alt={`Product image ${index + 1}`}
          width={100}
          height={100}
          className="rounded-lg shadow-md"
          unoptimized // Thêm nếu cần xử lý file local
        />
      ))}
    </div>
    <button
      onClick={onReset}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Thêm sản phẩm khác
    </button>
  </div>
));
ProductDisplay.displayName = "ProductDisplay";

// Memoized Form component
const ProductInputForm = memo(({ onSubmit, loading }: {
  onSubmit: (data: ProductForm) => void;
  loading: boolean;
}) => {
  const { register, handleSubmit } = useForm<ProductForm>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-2xl font-bold">Nhập thông tin</h2>
      <div>
        <label className="block text-sm font-medium">Tiêu đề</label>
        <input
          {...register("title")}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Hạn sử dụng</label>
        <input
          type="date"
          {...register("expiryDate")}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Ảnh sản phẩm</label>
        <input
          type="file"
          {...register("productImages")}
          className="w-full border rounded p-2"
          accept="image/*"
          multiple
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
        disabled={loading}
      >
        {loading ? "Đang lưu..." : "Lưu để theo dõi"}
      </button>
    </form>
  );
});
ProductInputForm.displayName = "ProductInputForm";

export default function ProductFormComponent() {
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<ProductForm | null>(null);
  const [product, setProduct] = useState<ProductForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.user);
  const [toast, setToast] = useState<{
    message: string;
    keyword: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  } | null>(null);

  // Sử dụng useCallback để memoize các hàm
  const onSubmit = useCallback((data: ProductForm) => {
    setSubmittedData(data);
    setIsModalOpen(true);
  }, []);

  const handleSaveReminder = useCallback(async (days: number) => {
    setIsModalOpen(false);
    if (submittedData) {
      await storeProductToRemainder(submittedData, days);
    }
  }, [submittedData]);

  const storeProductToRemainder = useCallback(async (data: ProductForm, days: number) => {
    setLoading(true);
    if (!user) {
      setToast({ message: "Người dùng không hợp lệ!", keyword: "ERROR" });
      setLoading(false);
      return;
    }

    try {
      const files = Array.from(data.productImages);
      const imageUrls = await Promise.all(files.map(file => getUrlUpdateUserImg(file)));

      const response = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          expiryDate: data.expiryDate,
          images: imageUrls,
        }),
      });

      if (!response.ok) throw new Error("Failed to create product");
      const newProduct = await response.json();

      setProduct(newProduct);
      const isStore = await storeSaveProductToReceiptNotification(
        user.id,
        newProduct.data._id,
        newProduct.data.expiryDate,
        days,
      );

      setToast({
        message: isStore ? "Lưu sản phẩm thành công!" : "Sản phẩm đã tồn tại!",
        keyword: isStore ? "SUCCESS" : "ERROR"
      });
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error);
      setToast({ message: "Đã xảy ra lỗi khi lưu sản phẩm!", keyword: "ERROR" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const resetProduct = useCallback(() => setProduct(null), []);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      {product ? (
        <ProductDisplay product={product} onReset={resetProduct} />
      ) : (
        <ProductInputForm onSubmit={onSubmit} loading={loading} />
      )}

      {toast && <ToastNotification message={toast.message} keyword={toast.keyword} />}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white p-6 rounded-lg shadow-lg relative w-[90%] max-w-md flex flex-col items-center gap-4"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              <AiOutlineClose className="text-2xl" />
            </button>
            <Image src={LOGO.src} alt="Logo" width={100} height={100} className="object-contain" />
            <h2 className="text-lg font-semibold text-black text-center px-4">
              Bạn muốn nhận thông báo về ngày hết hạn của sản phẩm bao lâu trước ngày hết hạn?
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {[1, 2, 3, 4, 5].map((day) => (
                <button
                  key={day}
                  onClick={() => handleSaveReminder(day)}
                  className="px-3 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                >
                  {day} ngày
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}