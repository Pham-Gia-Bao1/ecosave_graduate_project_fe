"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/api";
import { Product } from "@/types";
import { FaSearch } from "react-icons/fa";

interface SearchProductProps {
  storeId?: number;
  setListProducts: (products: Product[]) => void;
  setLoadingProducts: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
}

const DEBOUNCE_DELAY = 300; // Thời gian debounce (ms)

export default function SearchProduct({
  storeId,
  setListProducts,
  setLoadingProducts,
  setCurrentPage,
}: SearchProductProps) {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Đồng bộ searchQuery với URL khi component mount hoặc searchParams thay đổi
  useEffect(() => {
    const params = new URLSearchParams(searchParams || "");
    const queryFromUrl = params.get("name") || "";
    setSearchQuery(queryFromUrl);
  }, [searchParams]);

  // Cập nhật URL dựa trên searchQuery
  const updateURL = useCallback(
    (query: string) => {
      const params = new URLSearchParams();

      if (query.trim()) {
        params.set("name", query.trim());
      }
      if (storeId) {
        params.set("store_id", storeId.toString());
      }

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [storeId, router]
  );

  // Debounced search handler
  const handleSearchProduct = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      setLoadingProducts(true);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const timeout = setTimeout(async () => {
        abortControllerRef.current = new AbortController();
        try {
          const filters = {
            name: query.trim() || undefined,
            store_id: storeId,
          };
          const searchResults = await api.products.getList(filters, {
            signal: abortControllerRef.current.signal,
          });
          setListProducts(searchResults);
        } catch (error: unknown) {
          if ((error as Error).name !== "AbortError") {
            console.error("Search failed:", error);
            setListProducts([]); // Fallback về danh sách rỗng nếu lỗi
          }
        } finally {
          setLoadingProducts(false);
        }
      }, DEBOUNCE_DELAY);

      debounceTimeoutRef.current = timeout;
      updateURL(query); // Cập nhật URL ngay lập tức
    },
    [storeId, setListProducts, setLoadingProducts, setCurrentPage, updateURL]
  );

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
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
  );
}
