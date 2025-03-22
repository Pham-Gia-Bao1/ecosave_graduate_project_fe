import { ProductScan } from "@/types";
const serverUrl = process.env.REALTIME_SERVER_KEY || "https://ecosave-realtime.zeabur.app/api";
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
  if (!productIds?.length) return null;

  if (typeof window === "undefined") return null;

  return axios
    .post<{ status: string; code: number; message: string; data: ProductScan[] }>(
      `${serverUrl}/products/by-ids`,
      { productIds },
      { timeout: 5000 } // Giới hạn thời gian chờ 5s để tối ưu tốc độ
    )
    .then(({ data }) => {
      if (data.status !== "success" || data.code !== 200) return null;
      console.log(`✅ Lấy ${data.data.length} sản phẩm thành công.`);
      return data.data;
    })
    .catch((error) => {
      console.error("❌ Lỗi khi lấy sản phẩm:", error);
      return null;
    });
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


