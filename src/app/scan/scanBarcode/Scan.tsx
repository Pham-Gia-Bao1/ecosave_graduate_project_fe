"use client";
import { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Quagga from "quagga";
import { motion, AnimatePresence } from "framer-motion";
import ScanProduct from "./ScanProductInfo";
import ScanAIGenerate from "./ScanAIGenerate";
import { ProductScan } from "@/types";
import LOGO from "../../../assets/images/logo/LOGO.png";
import { AiOutlineClose } from "react-icons/ai";

import {
  storeSaveProductToReceiptNotification,
} from "@/api";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import ToastNotification from "@/components/toast/ToastNotification";
import Image from "next/image";
import Link from "next/link";
import { formatDateTime } from "@/utils";
const BarcodeScanner = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const seenCodes = useRef(new Set<string>());
  const [product, setProduct] = useState<ProductScan | undefined | null>(null);
  const [showProduct, setShowProduct] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    message: string;
    keyword: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  } | null>(null);

  useEffect(() => {
    if (!isScanning || !videoRef.current) return;
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
      (err: any) => {
        if (err) {
          console.error("Error initializing Quagga:", err);
          return;
        }
        Quagga.start();
      }
    );
    const handleDetected = (data: any) => {
      const scannedCode = data.codeResult.code;
      if (!scannedCode || seenCodes.current.has(scannedCode)) return;
      // Kiểm tra mã vạch phải đủ 13 số
      if (scannedCode.length !== 13) {
        setToast({
          message: "Mã vạch không hợp lệ! Phải đủ 13 số.",
          keyword: "ERROR",
        });
        return;
      }
      seenCodes.current.add(scannedCode);
      setTimeout(() => seenCodes.current.delete(scannedCode), 1000);
      setBarcode(scannedCode);
      setIsScanning(false);
      Quagga.stop();
      // Hiển thị sản phẩm sau 1 giây
      setTimeout(() => {
        setShowProduct(true);
      }, 1000);
    };
    Quagga.onDetected(handleDetected);
    return () => {
      Quagga.offDetected(handleDetected);
      Quagga.stop();
    };
  }, [isScanning]);
  const restartScanning = () => {
    setBarcode(null);
    setShowProduct(false);
    setIsScanning(true);
  };
  const storeProductToRemainder = async (days: number) => {
    setLoading(true);
    if (!user || !product) {
      setToast({
        message: "Người dùng hoặc sản phẩm không hợp lệ!",
        keyword: "ERROR",
      });
      return null;
    }
    try {
      const isStore = await storeSaveProductToReceiptNotification(
        user.id,
        product._id,
        product.expiryDate,
        days // Truyền số ngày được chọn vào API
      );
      console.log(isStore);
      if (!isStore) {
        setToast({ message: "Sản phẩm đã tồn tại", keyword: "ERROR" });
        return null;
      }
      setToast({ message: "Lưu sản phẩm thành công", keyword: "SUCCESS" });
      setIsSuccess(true);
      return isStore;
    } catch (error: any) {
      console.error("Lỗi khi lưu sản phẩm:", error);
      let errorMessage = "Đã xảy ra lỗi!";
      if (error.response?.data) {
        errorMessage = error.response.data.error || error.response.data.message;
      }
      setToast({ message: errorMessage, keyword: "ERROR" });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSaveReminder = (days: number) => {
    setIsModalOpen(false);
    storeProductToRemainder(days);
  };
  const ProductDisplay = memo(({ product }: { product: ProductScan }) => {
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

              <Image
                src={product.images[0]}
                alt={`Product image }`}
                width={120}
                height={120}
                className="rounded-lg shadow-md object-cover"
                unoptimized
              />

        </div>
        <div className="flex gap-3 justify-center items-center">
          <button
            onClick={restartScanning}
            className="mt-6 px-6 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-all duration-300 shadow-md"
          >
            Quét lại
          </button>
          <Link href="/expiry-items-reminder">
            <button className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-all duration-300 shadow-md">
              Xem các sản phẩm đã lưu
            </button>
          </Link>
        </div>
      </motion.div>
    );
  });
  ProductDisplay.displayName = "ProductDisplay";

  return (
    <>
      {(isSuccess && product) ? (
        <ProductDisplay product={product}/>
      ) : (
        <div
          className={`relative grid ${
            !product ? "grid-cols-1" : "grid-cols-2"
          } gap-0 p-4 text-white max-w-full w-auto mx-auto`}
        >
          {toast && (
            <ToastNotification
              message={toast.message}
              keyword={toast.keyword}
            />
          )}
          {/* Máy quét mã vạch */}
          <AnimatePresence>
            {!showProduct && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-start items-center border w-full"
              >
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 flex flex-col gap-3 justify-center items-center bg-black bg-opacity-70 z-50"
                  >
                    <h2 className="text-xl font-bold">📸 Quét mã Barcode</h2>
                    <p className="text-green-400 font-semibold">Đang quét...</p>
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-[320px] h-[250px] overflow-hidden bg-gray-800 border-4 border-blue-500 shadow-lg"
                    >
                      <div ref={videoRef} className="w-full h-full"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-scan"></div>
                    </motion.div>
                    <button
                      onClick={() => router.push("/scan")}
                      className="absolute top-[75%] right-[49%] text-white bg-white hover:bg-gray-100 p-2 rounded-full"
                    >
                      ❌
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {/* Hiển thị trạng thái quét thành công */}
          <AnimatePresence>
            {barcode && !showProduct && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 flex flex-col gap-3 justify-center items-center bg-black bg-opacity-70 z-50"
              >
                <h2 className="text-xl font-bold text-white">
                  ✅ Quét thành công!
                </h2>
                <p className="text-green-400 font-semibold">
                  Mã vạch: {barcode}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Hiển thị thông tin sản phẩm */}
          <AnimatePresence>
            {showProduct && barcode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-black p-4 border w-full"
              >
                <ScanProduct
                  barcode={barcode}
                  setProductForAiGenerate={setProduct}
                />
                <div
                  className={`${
                    !product ? "justify-center" : "justify-end"
                  } flex  w-full items-center gap-3 mt-4 px-4 text-white`}
                >
                  <button
                    onClick={restartScanning}
                    className="px-4 py-2 bg-primary hover:bg-primary-light transition shadow-lg rounded"
                  >
                    🔄 Quét lại
                  </button>
                  {!product ? (
                    <p className="text-red-500 font-semibold"></p>
                  ) : new Date(product.expiryDate) < new Date() ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded shadow-lg bg-gray-400 text-white opacity-50 cursor-not-allowed"
                    >
                      ❌ Sản phẩm đã hết hạn
                    </button>
                  ) : (
                    <button
                      onClick={handleOpenModal} // Mở modal
                      disabled={loading}
                      className={`px-4 py-2 rounded shadow-lg transition ${
                        loading
                          ? "bg-gray-400 text-white opacity-50 cursor-not-allowed"
                          : "bg-primary hover:bg-primary-light"
                      }`}
                    >
                      {loading
                        ? "⏳ Đang lưu..."
                        : "⭐ Lưu để theo dõi sản phẩm"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Gợi ý sản phẩm */}
          <AnimatePresence>
            {showProduct && barcode && product && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-black p-4 border w-full bg-white"
              >
                {product && <ScanAIGenerate product={product} />}
              </motion.div>
            )}
          </AnimatePresence>

          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
              {/* Modal Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white p-6 rounded-lg shadow-lg relative w-[90%] max-w-md flex flex-col items-center gap-4"
              >
                {/* Nút đóng modal với React Icons */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500 active:text-red-700 transition-colors"
                >
                  <AiOutlineClose className="text-2xl" />
                </button>

                {/* Logo */}
                <Image
                  src={LOGO.src}
                  alt="Logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />

                {/* Tiêu đề */}
                <h2 className="text-lg font-semibold text-black text-center px-4">
                  Bạn muốn nhận được thông báo về ngày hết hạn của sản phẩm bao
                  lâu trước ngày hết hạn?
                </h2>

                {/* Nút chọn số ngày */}
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <button
                      key={day}
                      onClick={() => handleSaveReminder(day)}
                      className="px-3 py-2 bg-primary text-white rounded hover:bg-primary-light"
                    >
                      {day} ngày
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default BarcodeScanner;
