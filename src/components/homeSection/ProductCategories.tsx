import api from "@/api";
import { Category, Product } from "@/types";
import React, { useState, useCallback, useEffect, useRef } from "react";
import ClassNames from "classnames";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCategoriesProps {
  categories: Category[];
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
}

const ProductCategories: React.FC<ProductCategoriesProps> = ({
  categories,
  setProducts,
  setLoading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [visibleItems, setVisibleItems] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(
    async (categoryId: number | null) => {
      setLoading(true);
      setSelectedCategory(categoryId);
      try {
        const products = categoryId
          ? await api.products.getByCategoryId(categoryId)
          : await api.products.getList({ page: 1 });
        setProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [setProducts, setLoading]
  );

  useEffect(() => {
    fetchProducts(null);
  }, [fetchProducts]);

  useEffect(() => {
    const updateVisibleItems = () => {
      if (typeof window !== "undefined") {
        const newVisibleItems = Math.floor(
          (window.innerWidth - 100) / (window.innerWidth < 640 ? 100 : 150)
        );
        setVisibleItems(newVisibleItems);
      }
    };

    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, []);

  const buttonVariants = {
    initial: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -2, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  const itemWidth = window.innerWidth < 640 ? 100 : 150;
  const totalItems = categories.length + 1;
  const maxScroll = (totalItems - visibleItems) * itemWidth;

  const handleScrollLeft = () => {
    setScrollPosition((prev) => Math.max(prev - itemWidth * visibleItems, 0));
  };

  const handleScrollRight = () => {
    setScrollPosition((prev) =>
      Math.min(prev + itemWidth * visibleItems, maxScroll)
    );
  };

  return (
    <div className="w-full px-4 py-3">
      <div className="flex lg:flex-col  sm:flex-row justify-between items-center text-center sm:text-left">
        <h2 className="text-lg sm:text-xl font-bold hidden lg:block">Danh Mục Sản Phẩm</h2>
        <span className="text-gray-500 mt-2 sm:mt-0 cursor-pointer text-sm sm:text-base ">
          Danh mục hàng đầu của tuần
        </span>
      </div>

      <div className="mt-2 flex items-center w-full">
        <button
          onClick={handleScrollLeft}
          disabled={scrollPosition === 0}
          className={ClassNames(
            "p-2 rounded-full hidden sm:flex",
            scrollPosition === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-200"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="overflow-x-auto scrollbar-hide flex-1 w-full py-3">
          <motion.div
            ref={containerRef}
            className="flex gap-2 sm:gap-3 whitespace-nowrap"
            animate={{ x: -scrollPosition }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ minWidth: "max-content" }}
          >
            {[{ id: null, name: "Tất cả" }, ...categories].map(({ id, name }) => (
              <motion.div
                key={id ?? "all"}
                className={ClassNames(
                  "flex justify-center gap-2 items-center p-2 sm:p-4 rounded-lg cursor-pointer transition-colors",
                  selectedCategory === id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:shadow-lg"
                )}
                onClick={() => fetchProducts(id)}
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <p className="font-medium text-xs sm:text-sm text-center">{name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <button
          onClick={handleScrollRight}
          disabled={scrollPosition >= maxScroll}
          className={ClassNames(
            "p-2 rounded-full hidden sm:flex",
            scrollPosition >= maxScroll
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-200"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ProductCategories;
