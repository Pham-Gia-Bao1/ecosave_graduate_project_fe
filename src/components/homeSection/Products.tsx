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
import { useDispatch } from "react-redux";
import { increment } from "@/redux/cartSlice";
import { useParams } from "next/navigation";
import { createPortal } from "react-dom";
import fallbackImage from "../../assets/images/products/product1.png";
import { Product } from "@/types";
import { useUserLocation } from "@/hooks/useUserLocation";
import { getProducts, addToCart } from "@/api";
import ToastNotification from "../toast/ToastNotification";
import calculateDistance from "@/utils/calculateDistance";
import { formatMoney } from "@/utils";
import SubLoading from "../loading/subLoading";
import { motion } from "framer-motion";
// Constants
const ITEMS_PER_PAGE = 8;
const DEBOUNCE_DELAY = 500;
const TOAST_DURATION = 3000;
interface ProductsProps {
  products: Product[];
  loading?: boolean;
}
export default function Products({
  products: initialProducts,
  loading: initialLoading,
}: ProductsProps) {
  const dispatch = useDispatch();
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
  // Toggle favorite product
  const toggleFavorite = useCallback((productId: number) => {
    setFavoriteProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);
  // Add to cart handler
  const handleAddToCart = useCallback(
    async (product: Product) => {
      setLoading((prev) => ({ ...prev, [product.id]: true }));
      const result = await addToCart(product.id, 1);
      setToast({
        message: result.message,
        keyword: result.success ? "SUCCESS" : "ERROR",
      });
      dispatch(increment());
      setLoading((prev) => ({ ...prev, [product.id]: false }));
      setTimeout(() => setToast(null), TOAST_DURATION);
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
      className="relative rounded-lg shadow-soft bg-white pb-5 transition-transform duration-300 hover:scale-105 hover:shadow-strong"
    >
      {product.discount_percent > 0 && (
        <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
          Giảm {product.discount_percent}%
        </span>
      )}
      <Link href={`/products/${product.id}`} className="block">
        <div className="w-full h-[300px] overflow-hidden bg-gray-200">
          <Image
            src={product.images[0]?.image_url || fallbackImage.src}
            alt={product.name}
            width={600}
            height={600}
            loading="lazy"
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={50}
          />
        </div>
      </Link>
      <div className="mt-3 px-4">
        <div className="flex justify-between">
          <p className="flex-1 text-sm max-w-[100px] text-gray-500 truncate">
            {product.category.name}
          </p>
          <div className="flex-1 text-gray-500 flex justify-end gap-3 items-center">
            <p className="text-sm truncate">
              {userLocation
                ? `${calculateDistance(
                    [product.store.latitude, product.store.longitude],
                    userLocation
                  )} km`
                : "Không có thông tin vị trí"}
            </p>
            <div className="w-[1px] h-[70%] bg-gray-400" />
            <p className="text-sm max-w-[60px] truncate">
              {product.store.store_name}
            </p>
          </div>
        </div>
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-[17px] font-semibold truncate hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="flex justify-between items-center">
          <p className="text-primary-light font-bold">
            {formatMoney(Number(product.original_price), "VND")}
          </p>
          <div className="flex items-center gap-1">
            {product.rating}{" "}
            <AiFillStar className="text-yellow-400" size={16} />
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-4 px-4">
        <button
          className={`p-2 border rounded-full transition-all duration-300 ${
            favoriteProducts.includes(product.id)
              ? "bg-orange-500 text-white"
              : "bg-white text-red-500 hover:bg-red-500 hover:text-white"
          }`}
          onClick={() => toggleFavorite(product.id)}
        >
          {favoriteProducts.includes(product.id) ? (
            <AiFillHeart size={20} />
          ) : (
            <AiOutlineHeart size={20} />
          )}
        </button>
        <button
          onClick={() => handleAddToCart(product)}
          className="p-2 w-[75%] flex justify-center bg-primary rounded-full text-white hover:bg-primary-light"
        >
          {loading[product.id] ? (
            <SubLoading />
          ) : (
            <AiOutlineShoppingCart size={20} />
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
            onClick={() => setSearchQuery(searchQuery ? "" : " ")} // Toggle search visibility
            className="bg-orange-500 px-4 py-[10px] rounded"
          >
            <FaSearch className="text-white text-xl hover:text-primary-light transition-colors duration-300" />
          </button>
          <input
            value={searchQuery}
            onChange={(e) => handleSearchProduct(e.target.value)}
            type="text"
            placeholder="Tìm kiếm..."
            className={`search-input text-black ${
              searchQuery ? "open" : ""
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentProducts.map(renderProductCard)}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </section>
  );
}
