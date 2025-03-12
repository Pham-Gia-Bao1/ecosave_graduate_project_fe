"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import GoongMap, { getDistance } from "./MapPage";
import { MapListingType } from "@/types";
import Link from "next/link";
import notFoundImage from "../../assets/icons/LOGO-notfound.png";
const MapListing = ({
  listStores,
  userLatitude,
  userLongitude,
  loadingProps,
}: MapListingType) => {
  const [loading, setLoading] = useState<boolean>(loadingProps);
  // 🛠 Tính toán danh sách đã sắp xếp (memoized để tối ưu hiệu suất)
  const sortedStores = useMemo(() => {
    return listStores
      .map((listing) => ({
        ...listing,
        distance:
          getDistance(
            userLatitude,
            userLongitude,
            listing.latitude,
            listing.longitude
          ) / 1000, // Đổi sang km
      }))
      .sort((a, b) => a.distance - b.distance); // Sắp xếp từ gần đến xa
  }, [listStores, userLatitude, userLongitude]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <div>
        {sortedStores.length === 0 && (
          <h2 className="text-green-600 font-bold text-lg text-center">
            {sortedStores.length} cửa hàng đang có sản phẩm giảm giá quanh bạn
          </h2>
        )}
        <div className="max-h-[425px] overflow-auto scrollbar-container">
          {loading ? (
            <p className="text-center text-gray-600 animate-pulse">
              Đang tải dữ liệu...
            </p>
          ) : sortedStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <Image
                src={notFoundImage.src}
                alt="Không có cửa hàng"
                width={100}
                height={100}
                className="mb-6"
              />
              <p className="text-gray-600 text-lg">Không có cửa hàng nào cả</p>
              <p className="text-gray-500">
                Hãy quay lại sau để xem các ưu đãi mới nhất!
              </p>
            </div>
          ) : (
            sortedStores.map((listing) => (
              <Link key={listing.id} href={`/store/${listing.id}`}>
                <div className="rounded-lg p-4 flex gap-4 mb-4 hover:bg-gray-100 transition duration-300">
                  <Image
                    src={listing.avatar}
                    alt={listing.store_name}
                    width={200}
                    height={100}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg mb-1">
                        {listing.store_name}
                      </h3>
                      <p className="text-sm font-medium text-gray-700">
                        📍
                        {listing.distance < 1
                          ? `${(listing.distance * 1000).toFixed(0)}m `
                          : `${listing.distance.toFixed(2)} km `}
                        gần bạn
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {listing.store_type}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      {listing.address}
                    </p>
                    <p className="text-xs mb-1 truncate-description-2-line">
                      {listing.description}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      📧 {listing.contact_email} | 📞 {listing.contact_phone} |
                      {listing.opening_hours}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <div className="relative">
        <GoongMap
          loadingProps={loadingProps}
          listStores={sortedStores}
          userLatitude={userLatitude}
          userLongitude={userLongitude}
          setLoading={setLoading}
        />
      </div>
    </div>
  );
};
export default MapListing;
