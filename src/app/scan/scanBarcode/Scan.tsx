"use client";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Quagga, { QuaggaJSResultObject } from "quagga";
import { motion, AnimatePresence } from "framer-motion";
import ScanProduct from "./ScanProductInfo";
import ScanAIGenerate from "./ScanAIGenerate";
import { ProductScan } from "@/types";
import LOGO from "../../../assets/images/logo/LOGO.png";
import { AiOutlineClose } from "react-icons/ai";
import { storeSaveProductToReceiptNotification } from "@/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ToastNotification from "@/components/toast/ToastNotification";
import Image from "next/image";
import Link from "next/link";
import { formatDateTime } from "@/utils";
import {
  convertToVietnamTime,
  removeAMPM,
} from "@/utils/helpers/convertToVietnamTime";
import { FaBoxOpen, FaCheckCircle, FaEye, FaRedo } from "react-icons/fa";

// Định nghĩa types
interface Toast {
  message: string;
  type: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
}

const BarcodeScanner = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const videoRef = useRef<HTMLDivElement>(null);
  const seenCodes = useRef<Set<string>>(new Set());

  // State management với types rõ ràng
  const [state, setState] = useState<{
    loading: boolean;
    barcode: string | null;
    isScanning: boolean;
    product: ProductScan | null;
    showProduct: boolean;
    isModalOpen: boolean;
    isSuccess: boolean;
    toast: Toast | null;
  }>({
    loading: false,
    barcode: null,
    isScanning: true,
    product: null,
    showProduct: false,
    isModalOpen: false,
    isSuccess: false,
    toast: null,
  });

  const [availableDays, setAvailableDays] = useState<number[]>([]);

  useEffect(() => {
    if (state.product?.expiryDate) {
      const today = new Date();
      const expiry = new Date(state.product.expiryDate);
      const diffDays = Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Lọc danh sách số ngày nhắc nhở hợp lý
      const reminderDays = [1, 2, 3, 4, 5].filter((day) => day <= diffDays);
      setAvailableDays(reminderDays);
    }
  }, [state.product?.expiryDate]);

  // Quagga initialization và scanning logic
  useEffect(() => {
    if (!state.isScanning || !videoRef.current) return;

    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: videoRef.current,
          constraints: { facingMode: "environment", frameRate: { ideal: 30 } },
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
          ],
        },
        locate: true,
        patchSize: "small",
      },
      (err?: Error) => {
        // Changed to optional parameter
        if (err) {
          console.error("Quagga initialization failed:", err);
          setState((prev) => ({
            ...prev,
            toast: { message: "Không thể khởi tạo máy quét", type: "ERROR" },
          }));
          return;
        }
        Quagga.start();
      }
    );

    const handleDetected = (data: QuaggaJSResultObject) => {
      const scannedCode = data.codeResult.code;
      if (!scannedCode || seenCodes.current.has(scannedCode)) return;

      seenCodes.current.add(scannedCode);
      setTimeout(() => seenCodes.current.delete(scannedCode), 1000);

      setState((prev) => ({
        ...prev,
        barcode: scannedCode,
        isScanning: false,
      }));
      Quagga.stop();

      setTimeout(() => {
        setState((prev) => ({ ...prev, showProduct: true }));
      }, 1000);
    };

    Quagga.onDetected(handleDetected);
    return () => {
      Quagga.offDetected(handleDetected);
      if (Quagga) Quagga.stop();
    };
  }, [state.isScanning]);

  // Functions
  const restartScanning = useCallback(() => {
    setState((prev) => ({
      ...prev,
      barcode: null,
      showProduct: false,
      isScanning: true,
      isSuccess: false,
    }));
  }, []);

  const storeProductToRemainder = useCallback(
    async (days: number) => {
      if (!user || !state.product) {
        setState((prev) => ({
          ...prev,
          toast: { message: "Dữ liệu không hợp lệ", type: "ERROR" },
        }));
        return;
      }

      setState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await storeSaveProductToReceiptNotification(
          user.id,
          state.product._id,
          state.product.expiryDate,
          days
        );

        if (!response) {
          setState((prev) => ({
            ...prev,
            toast: { message: "Sản phẩm đã tồn tại", type: "ERROR" },
          }));
        } else {
          setState((prev) => ({
            ...prev,
            toast: { message: "Lưu thành công", type: "SUCCESS" },
            isSuccess: true,
          }));
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Lỗi khi lưu sản phẩm";
        setState((prev) => ({
          ...prev,
          toast: { message: errorMessage, type: "ERROR" },
        }));
      } finally {
        setState((prev) => ({ ...prev, loading: false }));
        setTimeout(() => setState((prev) => ({ ...prev, toast: null })), 3000);
      }
    },
    [user, state.product]
  );

  const toggleModal = useCallback(() => {
    setState((prev) => ({ ...prev, isModalOpen: !prev.isModalOpen }));
  }, []);

  const handleSaveReminder = useCallback(
    (days: number) => {
      toggleModal();
      storeProductToRemainder(days);
    },
    [toggleModal, storeProductToRemainder]
  );

  console.log(state.product);
  const ProductDisplay = memo(({ product }: { product: ProductScan }) => (
    <div className="relative flex items-center justify-center min-h-[400px] mt-6">
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-6 bg-white shadow-soft relative z-10"
      >
        {/* Title */}
        <h2 className="text-2xl font-semibold text-primary flex items-center justify-center gap-2 mb-5">
          <FaCheckCircle className="text-primary text-3xl" />
          Sản phẩm đã được lưu!
        </h2>

        {/* Product Details */}
        <div className="space-y-4 flex justify-center items-center flex-col">
          <p className="text-gray-700 text-lg flex items-center gap-2">
            <span className="font-semibold">Tên sản phẩm</span>
            <span className="ml-1 text-gray-900">{product.title}</span>
          </p>
          <p className="text-gray-700 text-lg flex items-center gap-2">
            <span className="font-semibold">Hạn sử dụng:</span>
            <span className="ml-1 text-gray-900">
              {convertToVietnamTime(formatDateTime(product.expiryDate))}
            </span>
          </p>
        </div>

        {/* Product Image */}
        <div className="flex justify-center mt-6">
          <Image
            src={product.images[0]}
            alt={`Hình ảnh sản phẩm ${product.title}`}
            width={340}
            height={340}
            className="rounded-xl shadow-md object-cover border border-gray-200"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center items-center mt-6">
          <button
            onClick={restartScanning}
            className="px-6 py-2 flex items-center gap-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-all duration-300 shadow-md border border-gray-300"
            aria-label="Quét lại mã vạch"
          >
            <FaRedo className="text-gray-700" />
            Quét lại
          </button>
          {product && (
            <Link href="/expiry-items-reminder">
              <button className="px-6 py-2 flex items-center gap-2 bg-primary text-white rounded-lg hover:bg-primary transition-all duration-300 shadow-md">
                <FaEye />
                Xem sản phẩm đã lưu
              </button>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  ));

  ProductDisplay.displayName = "ProductDisplay";

  // Render
  return (
    <>
      {state.isSuccess && state.product ? (
        <ProductDisplay product={state.product} />
      ) : (
        <div
          className={`relative grid ${
            !state.product ? "grid-cols-1" : "grid-cols-2"
          } gap-0 p-4 text-white max-w-full w-auto mx-auto`}
        >
          {state.toast && (
            <ToastNotification
              message={state.toast.message}
              keyword={state.toast.type}
            />
          )}

          <AnimatePresence>
            {!state.showProduct && state.isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex flex-col gap-3 justify-center items-center bg-black bg-opacity-70 z-50"
              >
                <h2 className="text-xl font-bold">📸 Quét mã Barcode</h2>
                <p className="text-green-400 font-semibold">Đang quét...</p>
                <div
                  className="relative w-[320px] h-[250px] overflow-hidden bg-gray-800 border-4 border-blue-500 shadow-lg"
                  ref={videoRef}
                />
                <button
                  onClick={() => router.push("/scan")}
                  className="absolute top-[75%] right-[49%] text-white bg-white hover:bg-gray-100 p-2 rounded-full"
                  aria-label="Hủy quét"
                >
                  ❌
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state.barcode && !state.showProduct && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex flex-col gap-3 justify-center items-center bg-black bg-opacity-70 z-50"
              >
                <h2 className="text-xl font-bold text-white">
                  ✅ Quét thành công!
                </h2>
                <p className="text-green-400 font-semibold">
                  Mã vạch: {state.barcode}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state.showProduct && state.barcode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-black p-4 border w-full"
              >
                <ScanProduct
                  barcode={state.barcode}
                  setProductForAiGenerate={(product) =>
                    setState((prev) => ({ ...prev, product }))
                  }
                />
                <div
                  className={`flex w-full items-center gap-3 mt-4 px-4 ${
                    state.product ? "justify-end" : "justify-center"
                  }`}
                >
                  <button
                    onClick={restartScanning}
                    className="px-4 py-2 bg-primary hover:bg-primary-light transition shadow-lg rounded text-white"
                  >
                    🔄 Quét lại
                  </button>

                  {state.product ? (
                    new Date(state.product.expiryDate) < new Date() ? (
                      <button
                        disabled
                        className="px-4 py-2 rounded shadow-lg bg-gray-400 text-white opacity-50 cursor-not-allowed"
                      >
                        ❌ Đã hết hạn
                      </button>
                    ) : (
                      <button
                        onClick={toggleModal}
                        disabled={state.loading}
                        className={`px-4 py-2 rounded shadow-lg transition ${
                          state.loading
                            ? "bg-gray-400 opacity-50 cursor-not-allowed"
                            : "bg-primary hover:bg-primary-light text-white"
                        }`}
                      >
                        {state.loading ? "⏳ Đang lưu..." : "⭐ Lưu sản phẩm"}
                      </button>
                    )
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state.showProduct && state.barcode && state.product && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-black p-4 border w-full bg-white"
              >
                <ScanAIGenerate product={state.product} />
              </motion.div>
            )}
          </AnimatePresence>

          {state.isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="bg-white p-6 rounded-lg shadow-lg relative w-[90%] max-w-md flex flex-col items-center gap-4"
              >
                <button
                  onClick={toggleModal}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  aria-label="Đóng modal"
                >
                  <AiOutlineClose className="text-2xl" />
                </button>
                <Image src={LOGO} alt="Logo" width={100} height={100} />
                <h2 className="text-lg font-semibold text-black text-center px-4">
                  Nhận thông báo trước ngày hết hạn bao lâu?
                </h2>
                <div className="flex space-x-2">
                  {availableDays.length > 0 ? (
                    [1, 2, 3, 4, 5].map((day) => (
                      <button
                        key={day}
                        onClick={() => handleSaveReminder(day)}
                        className="px-3 py-2 rounded text-white transition
                   bg-primary hover:bg-primary-light disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={day > availableDays[availableDays.length - 1]} // Vô hiệu hóa nếu ngày lớn hơn ngày còn lại
                      >
                        {day} ngày
                      </button>
                    ))
                  ) : (
                    <span className="text-red-500">Sản phẩm đã hết hạn!</span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
    </>
  );
};

export default BarcodeScanner;
