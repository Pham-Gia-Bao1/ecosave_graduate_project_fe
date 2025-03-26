// api/index.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { redirect } from 'next/navigation';
import { AppDispatch } from '@/redux/store';
import { setUser } from '@/redux/userSlice';
import { Category, FormData, Product, ProductFilters, Store, OrderData } from '@/types';

// Constants
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!;
const MAP_KEY = process.env.NEXT_PUBLIC_MAP_KEY!;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const GEO_API_URL = 'https://rsapi.goong.io/geocode';

// API Instance
const api: AxiosInstance = axios.create({
  baseURL: SERVER_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Cache Utility
const cache = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(key);
    const ttl = localStorage.getItem(`${key}_ttl`);
    if (data && ttl && Date.now() < Number(ttl)) return JSON.parse(data);
    return null;
  },
  set: <T>(key: string, data: T, duration = CACHE_DURATION): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}_ttl`, String(Date.now() + duration));
    }
  },
  clear: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_ttl`);
    }
  },
};

// Utility Functions
const getToken = (): string | null => localStorage.getItem('access_token');

const handleError = (error: unknown, context: string): never => {
  const message = axios.isAxiosError(error)
    ? error.response?.data?.message || error.message
    : (error as Error).message;
  throw new Error(`[${context}] ${message}`);
};

// Data Fetching with Cache
const fetchWithCache = async <T>(
  url: string,
  cacheKey: string,
  forceRefresh: boolean = false, // Tham số thứ 3 là forceRefresh
  options: AxiosRequestConfig = {} // Tham số thứ 4 là options
): Promise<T> => {
  if (!forceRefresh) {
    const cachedData = cache.get<T>(cacheKey);
    if (cachedData) return cachedData;
  }

  try {
    const { data } = await axios.get<{ data: T }>(url, {
      headers: { 'Cache-Control': 'no-store' },
      ...options, // Truyền options vào config của axios
    });
    cache.set(cacheKey, data.data);
    return data.data;
  } catch (error) {
    return handleError(error, `fetchWithCache: ${url}`);
  }
};

// Auth API
export const auth = {
  getCSRFToken: async (): Promise<string> => {
    const { data } = await api.get<{ csrf_token: string }>('/csrf-token');
    return data.csrf_token;
  },

  login: async (email: string, password: string): Promise<any> => {
    const csrfToken = await auth.getCSRFToken();
    const { data } = await api.post('/login', { email, password }, {
      headers: { 'X-CSRF-TOKEN': csrfToken },
    });
    return data;
  },

  logout: async (dispatch: AppDispatch): Promise<void> => {
    const token = getToken();
    try {
      // Gửi yêu cầu logout với token trong header
      await api.post('/logout', {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      // Xóa token và cập nhật state sau khi logout thành công
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      dispatch(setUser(null));
      document.cookie = "authToken=; path=/; secure; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      dispatch(setUser(null));
      document.cookie = 'authToken=; path=/; secure; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    } catch (error) {
      // Xử lý lỗi 401 hoặc các lỗi khác
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn('Token invalid or expired during logout. Proceeding with client-side cleanup.');
        localStorage.removeItem('access_token'); // Xóa token dù server từ chối
        dispatch(setUser(null));
        document.cookie = 'authToken=; path=/; secure; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        return;
      }
      handleError(error, 'logout');
    }
  },

  checkEmail: async (email: string): Promise<boolean> => {
    const { data } = await api.post<{ exists: boolean }>('/check-email', { email });
    return data.exists ?? false;
  },

  register: async (formData: FormData): Promise<any> => {
    const { data } = await axios.post(`${SERVER_URL}/register`, formData);
    return data;
  },

  fetchUser: async (): Promise<any> => {
    const cachedUser = cache.get<any>('user_data');
    if (cachedUser) return cachedUser;

    const token = getToken();
    if (!token) return null;

    const { data } = await api.get('/me', { headers: { Authorization: `Bearer ${token}` } });
    cache.set('user_data', data);
    return data;
  },

  getOrders: async (): Promise<any> => {
    const token = getToken();
    if (!token) return null;

    const cacheKey = 'user_orders';
    const cachedData = cache.get<any>(cacheKey);
    if (cachedData) return cachedData;

    const response = await fetch(`${SERVER_URL}/order-history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    cache.set(cacheKey, data, 60 * 1000); // 1 minute cache
    return data;
  },
};

// Geolocation API
export const geolocation = {
  getLatLng: async (address: string): Promise<{ lat: number; lng: number } | null> => {
    const { data } = await axios.get(GEO_API_URL, {
      params: { address, api_key: MAP_KEY },
    });
    return data.results?.[0]?.geometry?.location ?? null;
  },

  getSuggestions: async (query: string): Promise<any[]> => {
    const { data } = await axios.get(GEO_API_URL, {
      params: { address: query, api_key: MAP_KEY },
    });
    return data.results ?? [];
  },

  getAddressFromCoords: async (lat: number, lng: number): Promise<string> => {
    const { data } = await axios.get(GEO_API_URL, {
      params: { latlng: `${lat},${lng}`, api_key: MAP_KEY },
    });
    return data.results?.[0]?.formatted_address ?? 'No address found';
  },
};



// Product API
export const products = {
  getList: async (filters: ProductFilters, options?: RequestInit): Promise<Product[]> => {
    try {
      const params: any = { ...filters };
      if (filters.category_id && filters.category_id.length > 0) {
        params.category_id = filters.category_id.join(",");
      }
      if (filters.store_id) {
        params.store_id = filters.store_id;
      }

      // Check if running on client-side
      if (typeof window !== "undefined") {
        const cacheKey = `products_${JSON.stringify(params)}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      }

      const response = await axios.get(`${SERVER_URL}/products`, {
        params,
        headers: { "Cache-Control": "no-store" },
        signal: options?.signal ?? undefined,
      });

      const productList = response.data.data as Product[];

      // Store in cache only on client-side
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`products_${JSON.stringify(params)}`, JSON.stringify(productList));
      }

      return productList;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  getByStoreId: async (storeId: string | number): Promise<Product[]> => {
    return fetchWithCache<Product[]>(`${SERVER_URL}/products?store_id=${storeId}`, `products_store_${storeId}`) ?? [];
  },

  getByCategoryId: async (categoryId: string | number): Promise<Product[]> => {
    return fetchWithCache<Product[]>(`${SERVER_URL}/products?category_id=${categoryId}`, `products_category_${categoryId}`) ?? [];
  },

  getDetail: async (id: string): Promise<Product | null> => {
    return fetchWithCache<Product>(`${SERVER_URL}/products/${id}`, `product_${id}`);
  },

  getSaved: async (userId: number): Promise<string[] | null> => {
    const token = getToken();
    if (!token) return null;

    const { data } = await api.get<{ success: boolean; products: { code: string }[] }>('/save-products', {
      params: { user_id: userId },
      headers: { Authorization: `Bearer ${token}` },
    });

    return data.success && data.products.length ? data.products.map(p => p.code) : null;
  },
  getSavedAll: async (userId: number): Promise<string[] | null> => {
    const token = getToken();
    if (!token) return null;

    const { data } = await api.get<{ success: boolean; data: { code: string }[] }>('/saved-products/all', {
      params: { user_id: userId },
      headers: { Authorization: `Bearer ${token}` },
    });

    return data && data.data.length  ? data.data.map(p => p.code) : null;
  },
  checkExists: async (userId: number, code: string): Promise<boolean> => {
    const token = getToken();
    if (!token) return false;

    const { data } = await api.post<{ exists: boolean }>('/check-product-exists', { user_id: userId, code }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.exists ?? false;
  },

  saveToReceipt: async (userId: number, code: string, expiryDate?: string, reminderDays?: number): Promise<any> => {
    const token = getToken();
    if (!token || !userId || !code) return null;

    const formattedExpiry = expiryDate ? new Date(expiryDate).toISOString().split('T')[0] : null;
    const { data } = await api.post('/save-products', {
      user_id: userId,
      code,
      expiry_date: formattedExpiry,
      reminder_days: reminderDays,
    }, { headers: { Authorization: `Bearer ${token}` } });
    return data;
  },

  deleteSaved: async (code: string): Promise<boolean> => {
    const token = getToken();
    if (!token) return false;

    const response = await fetch(`${SERVER_URL}/save-products/${code}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  },
};

// Category API
export const categories = {
  getList: async (): Promise<Category[]> => {
    return fetchWithCache<Category[]>(`${SERVER_URL}/categories`, 'categories') ?? [];
  },
};

// Store API
export const stores = {
  getNearby: async (lat: number, lng: number): Promise<Store[]> => {
    return fetchWithCache<Store[]>(`${SERVER_URL}/stores?latitude=${lat}&longitude=${lng}`, `stores_near_${lat}_${lng}`) ?? [];
  },

  getById: async (id: string | number): Promise<Store | null> => {
    return fetchWithCache<Store>(`${SERVER_URL}/stores/${id}`, `store_${id}`);
  },
};

// Cart API
export const cart = {
  get: async (forceRefresh = false): Promise<any> => {
    const token = getToken();
    if (!token) {
      redirect('/login');
      return null;
    }

    const cacheKey = 'cart_data';
    if (!forceRefresh) {
      const cachedData = cache.get<any>(cacheKey);
      if (cachedData) return cachedData;
    }

    const { data } = await api.get('/cart', { headers: { Authorization: `Bearer ${token}` } });
    cache.set(cacheKey, data);
    return data;
  },

  getDetail: async (storeId: number): Promise<any> => {
    const token = getToken();
    if (!token) {
      redirect('/login');
      return null;
    }

    const { data } = await api.get(`/cart/${storeId}`, { headers: { Authorization: `Bearer ${token}` } });
    return data;
  },

  add: async (productId: number, quantity: number): Promise<any> => {
    const token = getToken();
    if (!token) return { success: false, message: 'Vui lòng đăng nhập' };

    const { data } = await api.post('/cart/add', { product_id: productId, quantity }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    cache.clear('cart_data');
    return data;
  },

  updateQuantity: async (storeId: number, productId: number, quantity: number): Promise<any> => {
    const token = getToken();
    if (!token) return null;

    const { data } = await api.put('/cart/update-quantity', { store_id: storeId, product_id: productId, quantity }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  remove: async (storeId: number, productId: number): Promise<any> => {
    const token = getToken();
    if (!token) return null;

    const { data } = await api.delete('/cart/remove-item', {
      headers: { Authorization: `Bearer ${token}` },
      data: { store_id: storeId, product_id: productId },
    });
    cache.clear('cart_data');
    return data;
  },
};

// Order API
export const orders = {
  create: async (orderData: OrderData): Promise<OrderData | null> => {
    const token = getToken();
    if (!token) return null;

    const { data } = await api.post<{ data: OrderData }>('/orders', orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.data;
  },
};

// Payment API
export const payment = {
  create: async (total: number): Promise<string> => {
    const token = getToken();
    if (!token) throw new Error('Vui lòng đăng nhập');

    const { data } = await api.post<{ status: string; data: string }>('/payment', { total }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (data.status !== 'success' || !data.data) throw new Error('Invalid payment response');
    return data.data;
  },
};

// Wishlist API
export const wishlist = {
  get: async (): Promise<any> => {
    const token = getToken();
    if (!token) return null;

    const { data } = await api.get('/wishlist', { headers: { Authorization: `Bearer ${token}` } });
    console.log(data.data)
    return data;
  },

  add: async (productId: number): Promise<any> => {
    const token = getToken();
    if (!token) return null;

    const { data } = await api.post('/wishlist', { product_id: productId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  remove: async (id: number): Promise<any> => {
    const token = getToken();
    if (!token) return null;

    const { data } = await api.delete(`/wishlist/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    return data;
  },

  getProductIds: async (): Promise<number[]> => {
    const token = getToken();
    if (!token) return [];

    const { data } = await api.get<number[]>('/wishlist/product-ids', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data ?? [];
  },
};

// Export all APIs
export default {
  auth,
  geolocation,
  products,
  categories,
  stores,
  cart,
  orders,
  payment,
  wishlist,
};