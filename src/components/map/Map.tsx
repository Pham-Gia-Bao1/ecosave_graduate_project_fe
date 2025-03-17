"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
const accessToken =  "3CQs7bV6GEP3O2s6qtWkhL30m1mAgZP4KeftcQlo"; // map titletitle
const mapLinkCss =
  process.env.MAP_CSS_LINK ||
  "https://tiles.goong.io/assets/goong_map_web.json";
const HomeMapSection = () => {
  const mapRef = useRef<InstanceType<typeof window.goongjs.Map> | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const defaultLocation: [number, number] = [108.2432527, 16.0600528];
  useEffect(() => {
    if (!accessToken) {
      console.error("GoongJS Access Token is missing!");
      return;
    }
    if (typeof window !== "undefined" && window.goongjs && !mapRef.current) {
      window.goongjs.accessToken = accessToken;
      mapRef.current = new window.goongjs.Map({
        container: mapContainerRef.current!,
        style: mapLinkCss,
        center: defaultLocation,
        zoom: 12,
      });
      const marker = new window.goongjs.Marker()
        .setLngLat(defaultLocation)
        .setPopup(new window.goongjs.Popup().setText("Địa chỉ của bạn"))
        .addTo(mapRef.current);
      mapRef.current.on("load", () => {
        console.log("Map loaded successfully");
      });
      return () => {
        marker.remove();
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, []);
  return (
    <div className="w-full relative">
      <div ref={mapContainerRef} className="w-full h-[300px]"></div>
      <Link href="/map">
        <p className="absolute top-2 right-2 bg-white text-primary px-3 py-1 rounded shadow">
          Xem nhiều hơn
        </p>
      </Link>
    </div>
  );
};
export default HomeMapSection;
