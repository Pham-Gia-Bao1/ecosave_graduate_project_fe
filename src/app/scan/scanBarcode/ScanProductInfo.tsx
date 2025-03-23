import { ProductScan, ScanProductInfoProps } from "@/types";
import {  formatDateTime, formatMoney } from "@/utils";
import {  removeTimeFromDate } from "@/utils/helpers/convertToVietnamTime";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const realTimeServerURL =
  process.env.REALTIME_SERVER_KEY || "https://ecosave-realtime.zeabur.app";
export default function ScanProduct({
  barcode,
  setProductForAiGenerate,
}: ScanProductInfoProps) {
  const [product, setProduct] = useState<ProductScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!barcode) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${realTimeServerURL}/api/products/barcode/${barcode}`
        );
        if (!response.ok) {
          setProductForAiGenerate(null);
          throw new Error("Không tìm thấy sản phẩm");
        }
        const { data } = await response.json();
        setProduct(data);
        setProductForAiGenerate(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [barcode]);
  if (loading) {
    return (
      <div className="p-6 rounded-lg w-full bg-white animate-fadeIn">
        <Skeleton height={240} className="rounded-md" />
        <h1 className="text-2xl font-bold mt-4">
          <Skeleton width={200} />
        </h1>
        <p className="text-gray-700">
          <Skeleton count={2} />
        </p>
        <div className="mt-4">
          <Skeleton width={100} height={20} />
        </div>
      </div>
    );
  }
  if (error) {
    return <p className="text-red-500 text-center text-lg">{error}</p>;
  }
  if (!product) return null;
  return (
    <div className="bg-white p-4 w-full animate-fadeIn">
      {/* Hình ảnh sản phẩm */}
      <div className="relative">
        <Image
          width={100}
          height={200}
          src={product.images[0]}
          alt={product.title}
          className="w-full h-60 object-contain rounded-md"
        />

      </div>
      {/* Thông tin sản phẩm */}
      <h1 className="text-2xl font-bold text-gray-900 mt-4">{product.title}</h1>
      <p className="text-gray-700">{product.description}</p>
      <div className="mt-4 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-red-600">
          {formatMoney(product.price, 'VND')}
        </h4>

      </div>
      {/* Chi tiết sản phẩm */}
      <h4 className="mt-6 text-lg font-semibold text-gray-800">
        Chi tiết sản phẩm
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-2">
        <DetailItem label="Thương hiệu" value={product.brand} />
        <DetailItem label="Trọng lượng" value={`${product.weight} kg`} />
        <DetailItem
          label="Kích thước"
          value={`${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm`}
        />
        <DetailItem label="Bảo hành" value={product.warrantyInformation} />
        <DetailItem
          label="Ngày sản xuất"
          value={removeTimeFromDate(formatDateTime(product.manufacturingDate))}
        />
        <DetailItem
          label="Ngày hết hạn"
          value={removeTimeFromDate(formatDateTime(product.expiryDate))}
        />
      </div>
    </div>
  );
}
// Component hiển thị chi tiết sản phẩm
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-100 p-2 rounded-md shadow-sm">
    <p className="font-medium text-gray-800">{label}</p>
    <span className="text-gray-600">{value}</span>
  </div>
);
