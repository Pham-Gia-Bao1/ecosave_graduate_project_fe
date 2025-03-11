import { ProductScan } from "@/types";
const serverUrl = process.env.REALTIME_SERVER_KEY || "http://localhost:4000/api";
import axios from 'axios';
export const fetchProductByBarcode = async (barcode: string | number) => {
  try {
    const response = await fetch(
      `${serverUrl}/api/products/barcode/${barcode}`
    );
    if (!response.ok) throw new Error("Không tìm thấy sản phẩm");
    const { data } = await response.json();
    return data;
  } catch (err) {
    console.log(err)
  }
};
export async function getProductsByIds(productIds: string[]): Promise<ProductScan[] | null> {
  if (typeof window === "undefined") {
    console.warn("⚠️ Không thể sử dụng sessionStorage trên server.");
    return null;
  }

  const cacheKey = `products_by_ids_${productIds.join("_")}`;
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    console.log(`✅ Lấy dữ liệu từ cache: ${cacheKey}`);
    return JSON.parse(cachedData) as ProductScan[];
  }

  const url = `${serverUrl}/products/by-ids`; // API URL

  try {
    const response = await axios.post<{ status: string; code: number; message: string; data: ProductScan[] }>(
      url, { productIds }
    );

    if (response.data.status === "success" && response.data.code === 200) {
      console.log("✅ Lấy sản phẩm thành công:", response.data.data);
      sessionStorage.setItem(cacheKey, JSON.stringify(response.data.data)); // Lưu vào cache
      return response.data.data;
    } else {
      console.log("⚠️ Lỗi API:", response.data.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
    return null;
  }
}

export async function getAllProducts(): Promise<ProductScan[] | null> {
  try {
    const response = await fetch(`${serverUrl}/api/products`);
    if (!response.ok) throw new Error("Không tìm thấy sản phẩm");

    const { data } = await response.json();
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
}


