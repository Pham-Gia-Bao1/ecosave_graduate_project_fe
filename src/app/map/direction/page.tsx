"use client";
import React, { useEffect, useState } from "react";
import Direction from "./Direction";
import getCookie from "@/utils/helpers/getCookie";
import Loading from "@/app/loading";

export default function Page() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [storeLocation, setStoreLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const location = localStorage.getItem("user_location");
      if (location) {
        try {
          setUserLocation(JSON.parse(location));
        } catch (error) {
          console.error("Lỗi parse user_location:", error);
        }
      }
    }

    const storedLocation = getCookie("storeLocation");
    if (storedLocation) {
      try {
        setStoreLocation(JSON.parse(storedLocation));
      } catch (error) {
        console.error("Lỗi parse storeLocation:", error);
      }
    }
  }, []);

  if (!userLocation || !storeLocation) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <Loading />
      </div>
    );
  }

  const [ulat, ulng] = userLocation;
  const [slat, slng] = storeLocation;

  return (
    <div className="h-[600px]">
      <Direction origin={`${ulat},${ulng}`} destination={`${slat},${slng}`} />
    </div>
  );
}
