"use client"
import React, { useState } from 'react';

export type ProductScan = {
  _id: string;
  title: string;
  expiryDate: string;
  thumbnail: string;
};

const products: ProductScan[] = [
  {
    _id: '1',
    title: 'Sữa tươi Vinamilk',
    expiryDate: '2024-06-10',
    thumbnail: 'https://via.placeholder.com/40',
  },
  {
    _id: '2',
    title: 'Bánh mì sandwich',
    expiryDate: '2024-07-15',
    thumbnail: 'https://via.placeholder.com/40',
  },
  {
    _id: '3',
    title: 'Nước cam ép',
    expiryDate: '2024-08-20',
    thumbnail: 'https://via.placeholder.com/40',
  },
];

const getDaysDifference = (expiryDate: string) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getExpiryColor = (daysRemaining: number) => {
  if (daysRemaining <= 10) return 'text-red-600';
  if (daysRemaining <= 30) return 'text-orange-500';
  return 'text-gray-500';
};

export default function ExpiryItemsReminder() {
  const [filter, setFilter] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductScan | null>(null);

  const filteredProducts = products.filter(product => {
    const daysRemaining = getDaysDifference(product.expiryDate);
    if (filter === null) return true;
    return daysRemaining <= filter;
  });

  return (
    <div className="flex p-4 max-w-full mx-auto border rounded-lg shadow-md bg-white">
      {/* Sidebar */}
      <div className="w-1/4 border-r pr-4">
        <h2 className="text-lg font-bold mb-4">Lọc theo thời gian hết hạn</h2>
        <ul className="space-y-2 text-gray-700">
          {[{ label: 'Tất cả sản phẩm', value: null },
            { label: 'Dưới 3 tháng', value: 90 },
            { label: 'Dưới 2 tháng', value: 60 },
            { label: 'Dưới 1 tháng', value: 30 },
            { label: 'Dưới 10 ngày', value: 10 },
            { label: 'Hết hạn', value: 0 }].map(({ label, value }) => (
            <li
              key={label}
              className={`cursor-pointer p-2 rounded-md ${filter === value ? 'bg-gray-300' : ''}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-2/4 px-4">
        <h2 className="text-2xl font-bold">Sản phẩm sắp hết hạn</h2>
        {filteredProducts.map((product) => {
          const daysRemaining = getDaysDifference(product.expiryDate);
          return (
            <div
              key={product._id}
              className={`flex items-center py-3 border-b last:border-0 cursor-pointer p-2 rounded-md ${selectedProduct?._id === product._id ? 'bg-gray-300' : ''}`}
              onClick={() => setSelectedProduct(product)}
            >
              <span className="text-lg">⚠️</span>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Sản phẩm: <span className="font-bold">{product.title}</span></p>
                <div className="flex items-center text-sm mt-1">
                  <img src={product.thumbnail} alt="icon" className="w-6 h-6 rounded-full mr-2" />
                  <span className="font-bold">Hạn sử dụng:</span>
                  <span className={`ml-1 ${getExpiryColor(daysRemaining)}`}>{product.expiryDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Product */}
      <div className="w-1/4 border-l pl-4">
        <h2 className="text-xl font-bold">Chi tiết sản phẩm</h2>
        {selectedProduct ? (
          <>
            <div className="w-full h-32 bg-gray-300 mt-2 flex items-center justify-center">
              <img src={selectedProduct.thumbnail} alt={selectedProduct.title} className="w-24 h-24 object-cover" />
            </div>
            <p className="font-bold mt-2">Tên sản phẩm</p>
            <p className="text-gray-700">{selectedProduct.title}</p>
            <p className="font-bold mt-2">Ngày hết hạn</p>
            <p className={`${getExpiryColor(getDaysDifference(selectedProduct.expiryDate))}`}>{selectedProduct.expiryDate}</p>
          </>
        ) : (
          <p className="text-gray-500">Chọn một sản phẩm để xem chi tiết</p>
        )}
      </div>
    </div>
  );
}