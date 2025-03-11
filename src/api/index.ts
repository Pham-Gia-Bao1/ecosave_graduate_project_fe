import { AppDispatch } from '@/redux/store';
import { setUser } from '@/redux/userSlice';
import {  Category, FormData, Product, ProductFilters, Store } from '@/types';
import axios from 'axios';
import { redirect } from 'next/navigation';
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const MAP_KEY = process.env.NEXT_PUBLIC_MAP_KEY;
// Fetch the CSRF token
const getCSRF = async () => {
  try {
    const response = await axios.get(`${serverUrl}/csrf-token`); // Correct endpoint for CSRF token
    return response.data.csrf_token; // Return only the CSRF token
  } catch (error) {
    console.error('Error fetching CSRF token:', error); // Log error message or response data
    throw error; // Rethrow the error if you want it to be handled elsewhere
  }
};
// Perform login request
const logIn = async (email: string, password: string, csrfToken: string) => {
  try {
    const response = await axios.post(
      `${serverUrl}/login`,
      {
        email,
        password
      },
      {
        headers: {
          'X-CSRF-TOKEN': csrfToken, // Pass CSRF token as a header
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data; // Assuming the server sends user data upon successful login
  } catch (error) {
    console.error('Error during login:', error); // Log the error
    throw error; // Rethrow the error for handling elsewhere
  }
};
export const checkEmail = async (email: string): Promise<boolean> => {
  try {
    const checkResponse = await axios.post(`${serverUrl}/check-email`, {
      email, // Gửi email trong phần data, không phải params
    });

    return checkResponse.data.exists; // Trả về true nếu email tồn tại, ngược lại là false
  } catch (error) {
    console.error("Lỗi khi kiểm tra email:", error);
    return false; // Mặc định trả về false nếu có lỗi
  }
};

export const logout = async (dispatch: AppDispatch) => {
  try {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      console.error("No access token found.");
      return;
    }

    const response = await axios.post(
      `${serverUrl}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.message == "User successfully signed out") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      dispatch(setUser(null));
      document.cookie = "authToken=; path=/; secure; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      console.log("Logout successful!");
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};



const fetchUserInfo = async (token: string) => {
  try {
    const response = await axios.get(`${serverUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data
  } catch (error) {
    throw error;
  }
}
async function getLatLng(address: string) {
  try {
    const response = await axios.get("https://rsapi.goong.io/geocode", {
      params: {
        address: address,
        api_key: MAP_KEY,
      },
    });
    const results = response.data.results;
    if (results && results.length > 0) {
      const { lat, lng } = results[0].geometry.location;
      return { lat, lng };
    } else {
      console.error("Không tìm thấy kết quả nào.");
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null;
  }
}
const getLocationSuggestions = async (query: string) => {
  const url = `https://rsapi.goong.io/Geocode?api_key=${MAP_KEY}&address=${encodeURIComponent(query)}`;
  try {
    const response = await axios.get(url);
    return response.data.results || [];
  } catch (error) {
    console.error("Error fetching location data", error);
    return [];
  }
};

export const getAddressFromCoordinates = async (latitude: string, longitude: string) => {
  const url = `https://rsapi.goong.io/Geocode?api_key=${MAP_KEY}&latlng=${latitude},${longitude}`;

  try {
    const response = await axios.get(url);
    const results = response.data.results;

    if (results.length > 0) {
      return results[0].formatted_address; // Trả về địa chỉ đầu tiên
    }

    return "Không tìm thấy địa chỉ phù hợp.";
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ từ tọa độ:", error);
    return "Lỗi khi lấy địa chỉ.";
  }
};



const register = async (formData: FormData) => {
  try {
    const response = await axios.post(
      `${serverUrl}/register`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  }
  catch (error) {
    console.error("Lỗi khi đăng ký:", error);
  }
};
async function getProducts(filters: ProductFilters, options?: RequestInit): Promise<Product[]> {
  try {
    const params: any = { ...filters };
    if (filters.category_id && filters.category_id.length > 0) {
      params.category_id = filters.category_id.join(",");
    }
    if (filters.store_id) {
      params.store_id = filters.store_id;
    }
    // Kiểm tra nếu đang chạy trên client-side
    if (typeof window !== "undefined") {
      const cacheKey = `products_${JSON.stringify(params)}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }
    const response = await axios.get(`${serverUrl}/products`, {
      params,
      headers: { "Cache-Control": "no-store" },
      signal: options?.signal ?? undefined, // Chỉ truyền nếu signal hợp lệ
    });
    const products = response.data.data as Product[];
    // Lưu cache chỉ khi chạy trên client
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`products_${JSON.stringify(params)}`, JSON.stringify(products));
    }
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
async function getProductByStoreId(storeId: string | number) {
  try {
    const response = await axios.get(`${serverUrl}/products?store_id=${storeId}`, {
      headers: { "Cache-Control": "no-store" },
    });
    console.log("Fetched products:", response.data.data);
    return response.data.data as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
async function getCategories(): Promise<Category[]> {
  try {
    const response = await axios.get(`${serverUrl}/categories`, {
      headers: { "Cache-Control": "no-store" },
    });
    return response.data.data as Category[];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}
async function getProductsByCategoryId(categoryId: number | string): Promise<Product[]> {
  if (typeof window === "undefined") {
    // Nếu đang chạy trên server (SSR), không thể sử dụng sessionStorage
    console.warn("⚠️ Không thể sử dụng sessionStorage trên server.");
    return [];
  }
  const cacheKey = `products_category_${categoryId}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  if (cachedData) {
    console.log(`✅ Lấy dữ liệu từ cache: ${cacheKey}`);
    return JSON.parse(cachedData) as Product[];
  }
  try {
    const response = await axios.get(`${serverUrl}/products?category_id=${categoryId}`, {
      headers: { "Cache-Control": "no-store" },
    });
    const products = response.data.data as Product[];
    // Cập nhật cache nếu có dữ liệu mới
    if (products.length > 0) {
      sessionStorage.setItem(cacheKey, JSON.stringify(products));
      console.log(`🔄 Cập nhật cache: ${cacheKey}`);
    } else {
      console.warn(`⚠️ API trả về dữ liệu rỗng, không cập nhật cache.`);
    }
    return products;
  } catch (error) {
    console.error("❌ Lỗi khi lấy dữ liệu:", error);
    return [];
  }
}
export const getProductDetail = async (id: string) => {
  const cacheKey = `product_detail_${id}`;
  // Kiểm tra nếu đang chạy trên client
  if (typeof window !== "undefined") {
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      console.log(`✅ Lấy dữ liệu từ cache: ${cacheKey}`);
      return JSON.parse(cachedData);
    }
  } else {
    console.warn("⚠️ Không thể sử dụng sessionStorage trên server.");
  }
  try {
    const response = await axios.get(`${serverUrl}/products/${id}`);
    const product = response.data.data;
    if (product && typeof window !== "undefined") {
      sessionStorage.setItem(cacheKey, JSON.stringify(product));
      console.log(`🔄 Cập nhật cache: ${cacheKey}`);
    } else {
      console.warn(`⚠️ API trả về dữ liệu rỗng, không cập nhật cache.`);
    }
    return product;
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", error);
    return null;
  }
};
async function getNearingStores(latitude: number, longitude: number): Promise<Store[]> {
  try {
    const response = await axios.get(`${serverUrl}/stores?latitude=${latitude}&longitude=${longitude}`, {
      headers: { "Cache-Control": "no-store" },
    });

    return response.data.data as Store[];
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách cửa hàng gần nhất:", error);
    return [];
  }
}

async function getStoreById(id: number | string): Promise<Store> {
  try {
    const response = await axios.get(`${serverUrl}/stores/${id}`, {
      headers: { "Cache-Control": "no-store" },
    });
    return response.data.data as Store;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error();
  }
}
interface PaymentResponse {
  status: string;
  message: string;
  data: string; // URL thanh toán VNPay
}
export async function makeNewPayment(total: number): Promise<string> {
  const token = localStorage.getItem("access_token");
  console.log(token)
  if (!token) {
    setTimeout(() => {
      window.location.href = "http://localhost:3000/login";
    }, 1000);
    throw new Error("Vui lòng đăng ký hoặc đăng nhập trước khi xem giỏ hàng!");
  }
  try {
    const res = await axios.post<PaymentResponse>(
      `${serverUrl}/payment`,
      { total },
      {
        headers: {
          "Cache-Control": "no-store",
          'Authorization': `Bearer ${token}`
        },
      }
    );
    if (res.data.status !== "success" || !res.data.data) {
      throw new Error("VNPay response is invalid");
    }
    return res.data.data; // Trả về URL thanh toán
  } catch (error) {
    console.error("Payment error:", error);
    throw new Error("Payment processing failed");
  }
}
export const getCart = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "http://localhost:3000/login";
    return null;
  }
  try {
    const response = await axios.get(`${serverUrl}/cart`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Lỗi API:", error.response.data);
      throw new Error(error.response.data?.error || "Không thể lấy dữ liệu giỏ hàng");
    } else if (error.request) {
      console.error("Không thể kết nối đến server:", error.request);
      throw new Error("Không thể kết nối đến máy chủ, vui lòng thử lại.");
    } else {
      console.error("Lỗi không xác định:", error.message);
      throw new Error("Đã xảy ra lỗi không xác định.");
    }
  }
};
export const addToCart = async (productId: number, quantity: number) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return { success: false, message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục." };
  }
  try {
    await axios.post(
      `${serverUrl}/cart/add`,
      { product_id: productId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, message: "Sản phẩm đã được thêm vào giỏ hàng! 🛒" };
  } catch (error: any) {
    let errorMessage = "Không thể thêm sản phẩm vào giỏ hàng.";
    if (error.response) {
      const apiError = error.response.data?.error;
      if (apiError === "This product is out of stock.") {
        errorMessage = "Sản phẩm đã hết hàng, vui lòng thử lại sau.";
      } else {
        errorMessage = apiError || errorMessage;
      }
    } else if (error.request) {
      errorMessage = "Không thể kết nối đến máy chủ, vui lòng thử lại.";
    } else {
      errorMessage = "Đã xảy ra lỗi không xác định.";
    }
    return { success: false, message: errorMessage };
  }
};
export const getCartDetail = async (storeId: number) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "http://localhost:3000/login";
    return null;
  }
  try {
    const response = await axios.get(`${serverUrl}/cart/${storeId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Lỗi từ API (ví dụ: 404, 401, 500)
      console.error("Lỗi API:", error.response.data);
      throw new Error(error.response.data?.error || "Lỗi khi tải giỏ hàng");
    } else if (error.request) {
      // Lỗi do không kết nối được với server
      console.error("Không thể kết nối đến server:", error.request);
      throw new Error("Không thể kết nối đến máy chủ, vui lòng thử lại.");
    } else {
      // Lỗi không xác định
      console.error("Lỗi không xác định:", error.message);
      throw new Error("Đã xảy ra lỗi không xác định.");
    }
  }
};
export const updateCartItemQuantity = async (storeId: number, productId: number, quantity: number) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return null;
  }
  try {
    const response = await axios.put(`${serverUrl}/cart/update-quantity`, {
      store_id: storeId,
      product_id: productId,
      quantity: quantity
    }, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Lỗi API khi cập nhật item:", error.response.data);
      throw new Error(error.response.data?.error || "Không thể cập nhật giỏ hàng");
    } else if (error.request) {
      console.error("Không thể kết nối đến server:", error.request);
      throw new Error("Không thể kết nối đến máy chủ, vui lòng thử lại.");
    } else {
      console.error("Lỗi không xác định:", error.message);
      throw new Error("Đã xảy ra lỗi không xác định.");
    }
  }
};
export const removeCartItem = async (storeId: number, productId: number) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return null;
  }
  try {
    const response = await axios.delete(`${serverUrl}/cart/remove-item`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      data: {
        store_id: storeId,
        product_id: productId
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Lỗi API khi xóa item:", error.response.data);
      throw new Error(error.response.data?.error || "Không thể xóa sản phẩm khỏi giỏ hàng");
    } else if (error.request) {
      console.error("Không thể kết nối đến server:", error.request);
      throw new Error("Không thể kết nối đến máy chủ, vui lòng thử lại.");
    } else {
      console.error("Lỗi không xác định:", error.message);
      throw new Error("Đã xảy ra lỗi không xác định.");
    }
  }
};
// Define a type for the order data
export interface OrderData {
  id: number;
  user_id: number;
  store_id: number;
  total_price: number;
  status: "pending" | "completed"; // Enum-like constraint
  order_code: string;
}
export const createNewOrder = async (orderData: OrderData): Promise<number | null> => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return null; // Return null if no token is found
  }
  try {
    const res = await axios.post(
      `${serverUrl}/orders`, // API endpoint
      orderData, // Order data payload
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Order created successfully:", res.data);
    return res.data.data.id; // Return response data
  } catch (error) {
    console.error("Error creating order:", error);
    throw error; // Rethrow for handling in the calling function
  }
};

export const storeSaveProductToReceiptNotification = async (
  userId: number,
  code: string,
  expiryDate?: string,
  reminderDays?: number
) => {
  try {
    if (!userId || !code) {
      console.error("Thiếu thông tin người dùng hoặc mã sản phẩm!");
      return null;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("Không tìm thấy access token!");
      return null;
    }

    // Chuyển đổi định dạng ngày thành YYYY-MM-DD (nếu có)
    let formattedExpiryDate = null;
    if (expiryDate) {
      const date = new Date(expiryDate);
      if (!isNaN(date.getTime())) {
        formattedExpiryDate = date.toISOString().split("T")[0];
      } else {
        console.error("Định dạng ngày không hợp lệ!");
        return null;
      }
    }

    const res = await axios.post(
      `${serverUrl}/save-products`,
      {
        user_id: userId,
        code: code,
        expiry_date: formattedExpiryDate,
        reminder_days: reminderDays,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Sản phẩm đã lưu thành công:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Lỗi khi lưu sản phẩm:", error?.response?.data || error.message);
    return false;
  }
};

export const fetchSaveProducts = async (userId: number, expiryDate: string) => {
  try {
    const token = localStorage.getItem("access_token"); // Nếu API yêu cầu token
    const res = await axios.get(`${serverUrl}/save-products`, {
      params: { user_id: userId, expiry_date: expiryDate },
      headers: {
        Authorization: `Bearer ${token}`, // Thêm nếu cần authentication
        "Content-Type": "application/json",
      },
    });
    // Trích xuất danh sách code từ API response
    const productCodes = res.data.map((product: { code: string }) => product.code);
    return productCodes;
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm đã lưu:", error);
    return [];
  }
};
export async function getSaveProductOfUser(userId: number): Promise<string[] | null> {
  if (typeof window === "undefined") {
    console.warn("⚠️ Không thể sử dụng sessionStorage trên server.");
    return null;
  }

  const cacheKey = `save_products_${userId}`;
  const storedData = sessionStorage.getItem(cacheKey);

  if (storedData) {
    console.log(`✅ Lấy dữ liệu từ cache: ${cacheKey}`);
    return JSON.parse(storedData) as string[];
  }

  const url = `${serverUrl}/save-products`; // API URL
  const token = localStorage.getItem("access_token");

  try {
    const response = await axios.get<{ success: boolean; products: { code: string }[] }>(url, {
      params: { user_id: userId },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.success) {
      const productIds = response.data.products.map((p) => p.code);
      console.log("✅ Product IDs:", productIds);

      sessionStorage.setItem(cacheKey, JSON.stringify(productIds)); // Lưu cache mới
      return productIds;
    } else {
      console.warn("⚠️ API returned false success status");
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching product IDs:", error);
    return null;
  }
}




export const checkProductExists = async (userId: number, code: string) => {
  const token = localStorage.getItem("access_token"); // Lấy token từ localStorage
  try {
    const res = await axios.post(
      `${serverUrl}/check-product-exists`,
      {
        user_id: userId,
        code: code,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào headers
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.exists; // Trả về true nếu sản phẩm đã tồn tại, ngược lại false
  } catch (error) {
    console.error("Lỗi khi kiểm tra sản phẩm:", error);
    return false; // Mặc định trả về false nếu có lỗi
  }
};
export const fetchUser = async () => {
  const cachedUser = sessionStorage.getItem("user_data");

  if (cachedUser) {
    return JSON.parse(cachedUser);
  }

  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("No access token found.");
    return null;
  }

  try {
    const response = await fetch(`${serverUrl}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const userData = await response.json();

    // Lưu vào sessionStorage để cache dữ liệu
    sessionStorage.setItem("user_data", JSON.stringify(userData));

    return userData;
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null;
  }
};


export const getUserOrders = async () => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch( `${serverUrl}/order-history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null;
  }
};

export { getProductByStoreId, getStoreById, getNearingStores, getCSRF, logIn, fetchUserInfo, register, getLatLng, getLocationSuggestions, getProducts, getCategories, getProductsByCategoryId };
