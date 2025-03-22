// app/map/page.tsx
import React, { Suspense } from "react";
import MapListing from "./MapListing";
import { Product, Store } from "@/types";
import Loading from "../loading";
import api from "@/api";
import Products from "@/components/homeSection/Products";
import ClientLocation from "./ClientLocation";
// Server component to fetch data
const MapPage = async ({
  searchParams,
}: {
  searchParams: { lat?: string; lng?: string };
}) => {
  const page = 1;
  let products: Product[] | null = null;
  let loading = true;
  try {
    products = await api.products.getList({ page });
    loading = false;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return (
      <div className="text-center text-orange-500">
        Lỗi khi lấy dữ liệu. Vui lòng thử lại sau
      </div>
    );
  }
  // Check if latitude and longitude are present in query parameters
  const latitude = searchParams.lat ? parseFloat(searchParams.lat) : null;
  const longitude = searchParams.lng ? parseFloat(searchParams.lng) : null;
  if (!latitude || !longitude) {
    // If no coordinates, render ClientLocation to get them
    return <ClientLocation />;
  }
  const stores: Store[] = await api.stores.getNearby(latitude, longitude);
  return (
    <Suspense fallback={<Loading />}>
      <MapListing
        listStores={stores}
        userLatitude={latitude}
        userLongitude={longitude}
        loadingProps={false}
      />
      <section className="relative min-h-96 px-12 flex flex-col md:flex-row items-start justify-between h-auto">
        <Products
          className="lg:grid-cols-5"
          products={products}
          loading={loading}
          ITEMS_PER_PAGE={10}

        />
      </section>
    </Suspense>
  );
};
export default MapPage;
