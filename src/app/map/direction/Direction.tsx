"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
const GOONG_MAPTILES_API_KEY = "YEhRSFL1iJ9L36gE9JBntr9CZbJeCdQuMYEKoEhR";
const GOONG_DIRECTIONS_API_KEY = "ciKymNkaZCbLIS6e6ZdXhTADft9jAJQerhyfI6cq";

interface DirectionProps {
  origin: string;
  destination: string;
}
const Direction = ({ origin, destination }: DirectionProps) => {
  const [route, setRoute] = useState<any>(null);
  const accessToken = "yn7zQK2me9A32r6ZVGl5BuBYBwjifSF3dqBbo9Wp";
  useEffect(() => {
    const fetchRoute = async () => {
      const url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&api_key=${GOONG_DIRECTIONS_API_KEY}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.routes) {
          setRoute(data.routes[0]);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };
    fetchRoute();
  }, [origin, destination]);
  useEffect(() => {
    if (typeof window !== "undefined" && window.goongjs) {
      window.goongjs.accessToken = accessToken;
      const center = origin.split(",").map(Number).reverse() as [
        number,
        number
      ];
      if (route) {
        const map = new window.goongjs.Map({
          container: "map",
          style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_API_KEY}`,
          center: center,
          zoom: 14,
        });
        const decodePolyline = (encoded: string) => {
          let index = 0,
            lat = 0,
            lng = 0,
            coordinates = [];
          while (index < encoded.length) {
            let b,
              shift = 0,
              result = 0;
            do {
              b = encoded.charCodeAt(index++) - 63;
              result |= (b & 0x1f) << shift;
              shift += 5;
            } while (b >= 0x20);
            const dlat = result & 1 ? ~(result >> 1) : result >> 1;
            lat += dlat;
            shift = 0;
            result = 0;
            do {
              b = encoded.charCodeAt(index++) - 63;
              result |= (b & 0x1f) << shift;
              shift += 5;
            } while (b >= 0x20);
            const dlng = result & 1 ? ~(result >> 1) : result >> 1;
            lng += dlng;
            coordinates.push([lng / 1e5, lat / 1e5]);
          }
          return coordinates;
        };
        const decodedPath = decodePolyline(route.overview_polyline.points);
        map.on("load", () => {
          let index = 0;
          const animateRoute = () => {
            if (index < decodedPath.length) {
              const slice = decodedPath.slice(0, index);
              map.getSource("route").setData({
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: slice,
                },
              });
              index++;
              requestAnimationFrame(animateRoute);
            }
          };
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [],
              },
            },
          });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            paint: {
              "line-color": "#ff6600",
              "line-width": 5,
            },
          });
          animateRoute();
          const [originLng, originLat] = origin
            .split(",")
            .map(Number)
            .reverse();
          const [destLng, destLat] = destination
            .split(",")
            .map(Number)
            .reverse();
          const originEl = document.createElement("div");
          originEl.className = "origin-marker";
          originEl.style.animation = "bounce 1s infinite";
          const popup = new window.goongjs.Popup({ offset: 25 }).setText(
            "Địa chỉ của bạn"
          );
          new window.goongjs.Marker({
            element: originEl,
            anchor: "center",
          })
            .setLngLat([originLng, originLat])
            .setPopup(popup)
            .addTo(map);
          popup.addTo(map);
          const el = document.createElement("div");
          el.innerHTML = "🏪";
          el.style.fontSize = "24px";
          el.style.animation = "fadeIn 1.5s";
          new window.goongjs.Marker(el)
            .setLngLat([destLng, destLat])
            .addTo(map);
        });
        return () => map.remove();
      }
    }
  }, [route, origin, destination]);
  return (
    <div className="relative h-full">
      <Link href="/">
        <span className="absolute top-4 left-5 bg-primary p-2 rounded z-50 cursor-pointer hover:bg-primary-light text-white transition-transform transform hover:scale-110">
          Trở về trang chủ
        </span>
      </Link>
      <div id="map" className="w-full h-full"></div>
    </div>
  );
};
export default Direction;
