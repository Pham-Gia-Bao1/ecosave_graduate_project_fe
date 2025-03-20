"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AiFillStar,
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {  setTotalItems } from "@/redux/cartSlice";
import { useParams } from "next/navigation";
import { createPortal } from "react-dom";
import fallbackImage from "../../assets/images/products/product1.png";
import { Notification, Product, ProductFilters } from "@/types";
import { useUserLocation } from "@/hooks/useUserLocation";
import { getProducts, addToCart, getCart } from "@/api";
import ToastNotification from "../toast/ToastNotification";
import calculateDistance from "@/utils/calculateDistance";
import { formatMoney } from "@/utils";
import SubLoading from "../loading/subLoading";
import { motion } from "framer-motion";
import { useWishlist } from "@/hooks/useWishlist";
import { RootState } from "@/redux/store";
import useSocket from "@/hooks/useSocket";
import clsx from "clsx";
// Constants

const DEBOUNCE_DELAY = 500;
const TOAST_DURATION = 3000;
const realTimeServerURL = "https://ecosave-realtime.zeabur.app/";
interface ProductsProps {
  products: Product[];
  loading?: boolean;
  className?: string;
  ITEMS_PER_PAGE?: number;

}
export default function Products({
  products: initialProducts,
  loading: initialLoading,
  className = "",
  ITEMS_PER_PAGE = 10,

}: ProductsProps & { className?: string }) {
  const { handleAddToWishlist, handleRemove } = useWishlist();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const favoriteProductIds = wishlist.map((item) => item.product_id);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const userLocation = useUserLocation();
  const params = useParams();
  const storeId =
    params && params.storeId
      ? parseInt(params.storeId as string, 10)
      : undefined;
  const [currentPage, setCurrentPage] = useState(1);
  const [listProducts, setListProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteProducts, setFavoriteProducts] = useState<number[]>([]);
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [loadingProducts, setLoadingProducts] = useState(
    initialLoading ?? false
  );
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const { notifications: newNotifications } = useSocket(realTimeServerURL) as {
    notifications: Notification[];
  };
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const CACHE_TTL = 15 * 60 * 1000; // 15 phút (có thể điều chỉnh)

  const updateCache = (updatedProducts: Product[], filters: ProductFilters) => {
    if (typeof window === "undefined") return;

    try {
      const cacheKey = `products_${JSON.stringify(filters)}`;
      const cacheTTLKey = `${cacheKey}_ttl`;
      const ttl = Date.now() + CACHE_TTL;

      sessionStorage.setItem(cacheKey, JSON.stringify(updatedProducts));
      sessionStorage.setItem(cacheTTLKey, ttl.toString());

      console.log("🟢 Cache updated:", cacheKey);
    } catch (error) {
      console.error("❌ Failed to update cache:", error);
    }
  };

  // Handle product creation
  const handleProductCreated = (notification: Notification) => {
    const newProduct = notification.data.product;
      setListProducts((prevProducts) => {
        const updatedProducts = [newProduct, ...prevProducts];
        updateCache(updatedProducts, { page: 1 }); // Truyền filters vào
        return updatedProducts;
      });
  };

  // Handle product update
  const handleProductUpdated = (notification: Notification) => {
    const updatedProduct = notification.data.product;

    setListProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      );
      updateCache(updatedProducts, { page: 1 }); // Truyền filters vào
      return updatedProducts;
    });
  };

  // Gộp useEffect lại để tránh lặp code
  useEffect(() => {
    newNotifications.forEach((notification) => {
      switch (notification.event) {
        case "product.created":
          handleProductCreated(notification);
          break;
        case "product.updated":
          handleProductUpdated(notification);
          break;
        default:
          break;
      }
    });
  }, [newNotifications, storeId]); // Đảm bảo dependencies đầy đủ


  const [toast, setToast] = useState<{
    message: string;
    keyword: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  } | null>(null);
  // Memoized calculations
  const totalPages = useMemo(
    () => Math.ceil(listProducts.length / ITEMS_PER_PAGE),
    [listProducts]
  );
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return listProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [listProducts, currentPage]);
  // Sync initial products when they change
  useEffect(() => {
    if (!searchQuery) {
      setListProducts(initialProducts);
    }
  }, [initialProducts, searchQuery]);

  // Debounced search handler
  const handleSearchProduct = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      setLoadingProducts(true);
      if (debounceTimeout) clearTimeout(debounceTimeout);
      const timeout = setTimeout(async () => {
        try {
          const searchResults = await getProducts({
            name: query.trim(),
            store_id: storeId,
          });
          setListProducts(searchResults);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setLoadingProducts(false);
        }
      }, DEBOUNCE_DELAY);
      setDebounceTimeout(timeout);
    },
    [debounceTimeout, storeId]
  );

  const toggleFavorite = (product: Product) => {
    setFavoriteProducts((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );

    const isInWishlist = wishlist.some(
      (item) => item.product_id === product.id
    );
    console.log(isInWishlist);
    if (!isInWishlist && user) {
      try {
        handleAddToWishlist({
          id: product.id,
          user_id: user.id,
          product_id: product.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product: product,
        });
        setToast({ message: "Đã thêm vào danh sách yêu thích", keyword: "SUCCESS" });
      } catch (error) {
        console.error("Lỗi khi thêm vào danh sách yêu thích:", error);
        setToast({ message: "Lỗi khi thêm vào danh sách yêu thích!", keyword: "ERROR" });
      }
    } else {
      try {
        handleRemove(product.id);
        setToast({ message: "Đã xóa khỏi danh sách yêu thích", keyword: "SUCCESS" });
      } catch (error) {
        console.error("Lỗi khi xóa khỏi danh sách yêu thích:", error);
        setToast({ message: "Lỗi khi xóa khỏi danh sách yêu thích!", keyword: "ERROR" });
      }
    }
  };

  // Add to cart handler
  const handleAddToCart = useCallback(
    async (product: Product) => {
      try {
        setLoading((prev) => ({ ...prev, [product.id]: true }));
        const result = await addToCart(product.id, 1);
        if (!result.success) throw new Error(result.message);

        const cart = await getCart();
        dispatch(setTotalItems(cart.data.total_items));
        setToast({ message: result.message, keyword: "SUCCESS" });
      } catch (error) {
        setToast({
          message:
            error instanceof Error ? error.message : "Failed to add to cart",
          keyword: "ERROR",
        });
      } finally {
        setLoading((prev) => ({ ...prev, [product.id]: false }));
        setTimeout(() => setToast(null), TOAST_DURATION);
      }
    },
    [dispatch]
  );
  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg p-4">
          <div className="bg-gray-300 w-full h-40 rounded-md" />
          <div className="mt-3 space-y-2">
            <div className="bg-gray-300 h-4 w-3/4 rounded" />
            <div className="bg-gray-300 h-4 w-1/2 rounded" />
          </div>
          <div className="mt-4 flex gap-4">
            <div className="bg-gray-300 h-10 w-full rounded" />
            <div className="bg-gray-300 h-10 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderProductCard = (product: Product) => (
    <motion.div
      initial={{ opacity: 0, y: -5, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 80, damping: 16 }}
      key={product.id}
      className="relative rounded-lg shadow-soft bg-white pb-3 transition-transform duration-300 hover:scale-105 hover:shadow-strong"
    >
      {product.discount_percent > 0 && (
        <span className="absolute top-1 left-1 bg-orange-500 text-white text-[15px] font-bold px-1 py-0.5 rounded">
          -{product.discount_percent}%
        </span>
      )}
      <Link href={`/products/${product.id}`} className="block">
        <div className="w-full h-[200px] overflow-hidden bg-gray-200 rounded-t-lg">
          <Image
            src={product.images[0]?.image_url || fallbackImage.src}
            alt={product.name}
            width={400}
            height={400}
            loading="lazy"
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={50}
          />
        </div>
      </Link>
      <div className="mt-3 px-3  space-y-1">
        <div className="flex justify-between ">
          <p className="text-xs max-w-[90px] text-gray-500 truncate">
            {product.category.name}
          </p>
          <div className="text-gray-500 flex gap-2 items-center text-xs">
            <p className="truncate">
              {userLocation
                ? (() => {
                    const distance = calculateDistance(
                      [product.store.latitude, product.store.longitude],
                      userLocation
                    );

                    return distance < 1
                      ? `${(distance * 1000).toFixed(0)}m`
                      : `${distance.toFixed(2)} km`;
                  })()
                : "Không có vị trí"}
            </p>
            <div className="w-[1px] h-[60%] bg-gray-400" />
            <p className="max-w-[50px] truncate">{product.store.store_name}</p>
          </div>
        </div>
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-[15px] font-semibold truncate hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="flex justify-between items-center">
          <div className="flex">
            <p className="text-primary-light font-bold text-sm">
              {formatMoney(Number(product.discounted_price), "VND")}
            </p>
            <p className="text-gray-500 font-bold line-through text-xs ml-1">
              {formatMoney(Number(product.original_price), "VND")}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">{product.rating}</span>
            <AiFillStar className="text-yellow-400" size={16} />
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-3 px-3">
        <motion.button
          className={`p-1.5 border rounded-full transition-all duration-300 ${
            favoriteProductIds.includes(product.id)
              ? "bg-orange-500 text-white"
              : "bg-white text-red-500 hover:bg-red-500 hover:text-white"
          }`}
          whileTap={{ scale: 0.8 }}
          animate={{
            scale: favoriteProductIds.includes(product.id) ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onClick={() => toggleFavorite(product)}
        >
          {favoriteProductIds.includes(product.id) ? (
            <AiFillHeart size={18} />
          ) : (
            <AiOutlineHeart size={18} />
          )}
        </motion.button>

        <button
          onClick={() => handleAddToCart(product)}
          className="p-1.5 w-[70%] flex justify-center bg-primary rounded-full text-white hover:bg-primary-light"
        >
          {loading[product.id] ? (
            <SubLoading />
          ) : (
            <AiOutlineShoppingCart size={18} />
          )}
        </button>
      </div>
    </motion.div>
  );

  // Render pagination
  const renderPagination = () => (
    <div className="flex justify-center mt-4">
      <button
        className="px-3 py-2 border rounded-l-md bg-gray-200 disabled:opacity-50"
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        Trước
      </button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          className={`px-4 py-2 border ${
            currentPage === index + 1 ? "bg-purple-200 font-bold" : "bg-white"
          }`}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      <button
        className="px-4 py-2 border rounded-r-md bg-gray-200 disabled:opacity-50"
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Sau
      </button>
    </div>
  );
  return (
    <section className="mx-auto w-full">
      {toast &&
        createPortal(
          <ToastNotification message={toast.message} keyword={toast.keyword} />,
          document.body
        )}
      <div className="flex justify-between items-center py-4">
        <h4 className="text-2xl font-bold">Sản Phẩm Bán Chạy</h4>
        <div className="relative">
          <button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="bg-orange-500 px-4 py-[10px] rounded"
          >
            <FaSearch className="text-white text-xl hover:text-primary-light transition-colors duration-300" />
          </button>
          <input
            value={searchQuery}
            onChange={(e) => handleSearchProduct(e.target.value)}
            type="text"
            placeholder="Tìm kiếm..."
            className={`search-input text-black border p-2 transition-all duration-300 ${
              isSearchVisible ? "block w-48 open" : "hidden"
            }`}
          />
        </div>
      </div>
      <div>
        {loadingProducts || initialLoading ? (
          renderLoadingSkeleton()
        ) : listProducts.length === 0 ? (
          <div className="flex justify-center items-center text-gray-500 mt-6 w-full  h-[300px]">
            <h3 className="text-xl">Không tìm thấy sản phẩm</h3>
          </div>
        ) : (
          <>
            <div
              className={clsx(
                "grid grid-cols-2 md:grid-cols-3 gap-6",
                className
              )}
            >
              {currentProducts.map(renderProductCard)}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </section>
  );
}
