"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Car } from "lucide-react";
import { StoreInfoProps } from "@/types";
import { useUserLocation } from "@/hooks/useUserLocation";
import calculateDistance from "@/utils/calculateDistance";
import Link from "next/link";

export function StoreInfo({ store }: StoreInfoProps) {
  const userLocation = useUserLocation();
  return (
    <div className="border rounded-lg p-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden relative">
            {store.avatar ? (
              <Image
                src={store.avatar}
                alt={store.store_name}
                width={300}
                height={300}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-600 font-medium flex items-center justify-center w-full h-full">
                {store.store_name[0]}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-lg">{store.store_name}</h3>
            <Link href={`/store/${store.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="hover:text-gray-500">Xem Shop</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:gap-6 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate text-[16px]">{store.address}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 shrink-0" />
            <span className="text-[16px]">{store.contact_phone}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 shrink-0" />
            <span className="text-[16px]">
            {userLocation
              ? (() => {
                  const distance = calculateDistance(
                    [store.latitude, store.longitude],
                    userLocation
                  );

                  if (isNaN(distance)) return "Lỗi tính toán khoảng cách";

                  return distance < 1
                    ? `${(distance * 1000).toFixed(0)}m `
                    : `${distance.toFixed(2)} km `;
                })()
              : "Đang xác định khoảng cách"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
