"use client";

import { formatDateTime, getUrlUpdateUserImg } from "@/utils";
import Image from "next/image";
import { useState, useCallback, memo } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { motion } from "framer-motion";
import LOGO from "../../../assets/images/logo/LOGO.png";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ToastNotification from "@/components/toast/ToastNotification";
import { storeSaveProductToReceiptNotification } from "@/api";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";

const serverUrl =
  process.env.REALTIME_SERVER_KEY || "http://localhost:4000/api";

export interface ProductForm {
  _id: string;
  title: string;
  expiryDate: string;
  productImages: FileList;
}
const ProductDisplay = memo(
  ({ product, onReset }: { product: ProductForm; onReset: () => void }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-6 bg-gray-50 rounded-xl"
      >
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          Sản phẩm đã được lưu!
        </h2>
        <div className="space-y-3">
          <p className="text-gray-600 text-lg">
            Tiêu đề:
            <span className="font-medium text-gray-800">{product.title}</span>
          </p>
          <p className="text-gray-600 text-lg">
            Hạn sử dụng:
            <span className="font-medium text-gray-800">
              {formatDateTime(product.expiryDate)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {product.productImages &&
            Array.from(product.productImages).map((file, index) => (
              <Image
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Product image ${index + 1}`}
                width={120}
                height={120}
                className="rounded-lg shadow-md object-cover"
                unoptimized
              />
            ))}
        </div>
        <div className="flex gap-3 justify-center items-center">
          <button
            onClick={onReset}
            className="mt-6 px-6 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-all duration-300 shadow-md"
          >
            Thêm sản phẩm mới
          </button>
          <Link href='/expiry-items-reminder'>
            <button className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-all duration-300 shadow-md">
              Xem các sản phẩm đã lưu
            </button>
          </Link>
        </div>
      </motion.div>
    );
  }
);

ProductDisplay.displayName = "ProductDisplay";
const ProductInputForm = memo(
  ({
    onSubmit,
    loading,
  }: {
    onSubmit: SubmitHandler<ProductForm>;
    loading: boolean;
  }) => {
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<ProductForm>({
      mode: "onChange",
      defaultValues: {
        title: "",
        expiryDate: "",
      },
    });
    const selectedFiles = watch("productImages");

    return (
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 p-6 rounded-xl"
      >
        <h2 className="text-2xl font-semibold text-gray-800">
          Thêm sản phẩm để nhắc nhở ngày hết hạn
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tên sản phẩm
          </label>
          <input
            {...register("title", {
              required: "Tên sản phẩm là bắt buộc",
              minLength: {
                value: 2,
                message: "Tên sản phẩm phải có ít nhất 2 ký tự",
              },
              maxLength: {
                value: 100,
                message: "Tên sản phẩm không được vượt quá 100 ký tự",
              },
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-primary transition-all ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập tên sản phẩm"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Hạn sử dụng
          </label>
          <input
            type="date"
            min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} // Ngày mai
            {...register("expiryDate", {
              required: "Hạn sử dụng là bắt buộc",
              validate: {
                futureDate: (value) => {
                  const selectedDate = new Date(value);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Đặt về 00:00 để so sánh
                  return (
                    selectedDate > today ||
                    "Hạn sử dụng phải là ngày trong tương lai"
                  );
                },
              },
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-primary transition-all ${
              errors.expiryDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.expiryDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.expiryDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Ảnh sản phẩm
          </label>
          <input
            type="file"
            {...register("productImages", {
              required: "Vui lòng chọn ít nhất một ảnh sản phẩm",
              validate: {
                fileSize: (files) =>
                  Array.from(files).every(
                    (file) => file.size <= 5 * 1024 * 1024
                  ) || "Mỗi ảnh không được vượt quá 5MB",
                fileType: (files) =>
                  Array.from(files).every((file) =>
                    file.type.startsWith("image/")
                  ) || "Chỉ chấp nhận file ảnh",
                maxFiles: (files) =>
                  files.length <= 5 || "Chỉ được tải lên tối đa 5 ảnh",
              },
            })}
            className={`w-full p-3 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary-light transition-all ${
              errors.productImages ? "border-red-500" : "border-gray-300"
            }`}
            accept="image/*"
            multiple
          />
          {errors.productImages && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productImages.message}
            </p>
          )}
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {Array.from(selectedFiles).map((file, index) => (
                <Image
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  width={100}
                  height={100}
                  className="rounded-lg shadow-md object-cover"
                  unoptimized
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Lưu sản phẩm"}
        </button>
      </motion.form>
    );
  }
);
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

  const onSubmit = useCallback((data: ProductForm) => {
    setSubmittedData(data);
    setIsModalOpen(true);
  }, []);

  const handleSaveReminder = useCallback(
    async (days: number) => {
      setIsModalOpen(false);
      if (submittedData) {
        await storeProductToRemainder(submittedData, days);
      }
    },
    [submittedData]
  );

  const storeProductToRemainder = useCallback(
    async (data: ProductForm, days: number) => {
      setLoading(true);
      if (!user) {
        setToast({ message: "Người dùng không hợp lệ!", keyword: "ERROR" });
        setLoading(false);
        return;
      }

      try {
        const files = Array.from(data.productImages);
        const imageUrls = await Promise.all(
          files.map((file) => getUrlUpdateUserImg(file))
        );

        const response = await fetch(`${serverUrl}/products`, {
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

        setProduct(newProduct.data);
        const isStore = await storeSaveProductToReceiptNotification(
          user.id,
          newProduct.data._id,
          newProduct.data.expiryDate,
          days
        );

        setToast({
          message: isStore
            ? "Lưu sản phẩm thành công!"
            : "Sản phẩm đã tồn tại!",
          keyword: isStore ? "SUCCESS" : "ERROR",
        });
      } catch (error) {
        console.error("Lỗi khi lưu sản phẩm:", error);
        setToast({
          message: "Đã xảy ra lỗi khi lưu sản phẩm!",
          keyword: "ERROR",
        });
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const resetProduct = useCallback(() => setProduct(null), []);

  return (
    <div className="min-h[80%] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {product ? (
          <ProductDisplay product={product} onReset={resetProduct} />
        ) : (
          <ProductInputForm onSubmit={onSubmit} loading={loading} />
        )}

        {toast && (
          <ToastNotification message={toast.message} keyword={toast.keyword} />
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-300 z-20 hover:text-red-600 transition-colors"
              >
                <AiOutlineClose className="text-xl" />
              </button>


              <div className="flex flex-col items-center gap-6">
                <Image
                  src={LOGO.src}
                  alt="Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
                <h2 className="text-xl font-semibold text-gray-800 text-center">
                  Nhận thông báo trước ngày hết hạn bao nhiêu ngày?
                </h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <button
                      key={day}
                      onClick={() => handleSaveReminder(day)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-all duration-300 shadow-md"
                    >
                      {day} ngày
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
