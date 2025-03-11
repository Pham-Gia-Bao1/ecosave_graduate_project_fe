export type UserLogin = {
  id: number;
  name: string;
  email: string;
};
export type LoginProps = {
  csrf: string;
};
export interface UserProfile {
  id: number; // ID của người dùng
  username: string; // Tên người dùng
  email: string; // Email
  email_verified_at: string; // Thời gian email được xác minh
  is_active: number; // Trạng thái kích hoạt (1: active, 0: inactive)
  avatar: string; // URL ảnh đại diện
  address: string; // Địa chỉ
  role: number; // Quyền hoặc vai trò của người dùng
  phone_number: string; // Số điện thoại
  latitude: string; // Vĩ độ (tọa độ)
  longitude: string; // Kinh độ (tọa độ)
  created_at: string; // Thời gian tạo tài khoản
  updated_at: string; // Thời gian cập nhật tài khoản
  password: string;
}
export type Store = {
  id: number;
  store_name: string;
  avatar: string;
  logo: string;
  store_type: string;
  opening_hours: string | null;
  status: string;
  contact_email: string | null;
  contact_phone: string | null;
  latitude: number;
  longitude: number;
  soft_description: string;
  address: string;
  description: string | null;
  user_id: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  products: Product[];
}
export interface Category {
  id: number;
  name: string;
}
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  image_order: number;
  created_at: string;
  updated_at: string;
}
export interface Product {
  id: number;
  name: string;
  description: string;
  original_price: string;
  discount_percent: number;
  product_type: string;
  discounted_price: string;
  expiration_date: string;
  stock_quantity: number;
  store_id: number;
  category_id: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  store: Store;
  rating: number;
  category: Category;
  images: ProductImage[];
  reviews: Review[];
  origin: string,
  usage_instructions: string,
  storage_instructions: string
}
export interface ProductFilters {
  page?: number;
  name?: string;
  store_name?: string;
  category_id?: number[];
  category_name?: string;
  expiration_date?: string;
  min_price?: number;
  max_price?: number;
  rating?: number;
  store_id?: string | number;
  distance?: string | number;
  user_lat?: string | number;
  user_lng?: string | number;
}
export type MapListingType = {
  listStores: Store[];
  userLatitude: number;
  userLongitude: number;
  loadingProps: boolean;
  setLoading?: (loading: boolean) => void;
};
export type GoongMapProps = MapListingType & {
  setLoading?: (loading: boolean) => void;
};

export interface CartItemProps {
  product: CartProduct;
  onRemove: (id: number) => void;
  onQuantityChange: (productId: number, newQuantity: number) => void;
}
export interface DeliveryAddressProps {
  storeLatitude: string;
  storeLongitude: string;
  storeAddress: string;
  userAddress: string;
  onChangeAddress: () => void;
}
export interface CartSummaryProps {
  total: number;
  savings: number;
  handlePayment: () => void;
}
export interface CartProduct {
  product_id: number;
  name: string;
  quantity: number;
  stock_quantity: number;
  original_price: string;
  discounted_price: string;
  subtotal: number;
  images: ProductImage[];
  isRemoving?: boolean;
  store_id?: string;
  price?: string | number;
  picture?: string;
  storeId?: number | string;
  orderId?: number | string;
}
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  image_order: number;
  created_at: string;
  updated_at: string;
}
export interface PaymentItem {
  id: number;
  name: string;
  price: string | number;
  quantity: number;
  picture: string;
  storeId: number | string;
  orderId?: number | string;
}
export interface PaymentState {
  items: PaymentItem[];
}
export interface OrderItem {
  product_id: number;
  product_name: string;
  product_image: string[]; 
  quantity: number;
  sub_price: number;
  unique_price: number;
}

export interface OrderData {
  store_id: number;
  store_name: string;
  order_id: number;
  order_code: string;
  total_price: number;
  saved_amount: number;
  status: "pending | completed" | "cancelled";
  order_date: Date;
  items: OrderItem[]; 
}
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}
export type ProductScan = {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  manufacturingDate: string;
  expiryDate: string;
  reviews: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  thumbnail: string;
  images: string[];
};
export interface ScanProductInfoProps {
  barcode: string;
  setProductForAiGenerate: (product: ProductScan | null) => void;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface BreadcrumbItem {
  label: string
  href: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export interface ProductDescriptionProps {
  description: string
  details: Product
}

export interface ProductGalleryProps {
  images: ImageType[];
}

export type ImageType = {
  id: number | string;
  product_id: number | string;
  image_url: string;
  image_order: number;
  created_at: string;
  updated_at: string;
};

export interface ProductInfoProps {
  product: Product;
}

export interface User {
  id: number;
  username: string;
  avatar?: string;
}

export interface ReviewsProps {
  reviews: Review[];
}

export type Review = {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  review_content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
};

export interface StoreInfoProps {
  store: Store;
}

export interface FormData {
  name: string;
  email: string;
  password: string;
  address: string;
  latitude: string;
  longitude: string;
  role_id: number;
  avatar : string | null;
  password_confirmation ?: string;
}
export interface Errors {
  name?: string;
  email?: string;
  address?: string;
  password?: string;
  password_confirmation?: string;
}