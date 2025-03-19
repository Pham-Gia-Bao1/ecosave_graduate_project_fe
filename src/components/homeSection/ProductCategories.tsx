import { getProducts, getProductsByCategoryId } from "@/api";
import { Category, Product } from "@/types";
import React, { useState, useCallback, useEffect, useRef } from "react";
import ClassNames from "classnames";
import { motion } from "framer-motion";
import {

  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const [visibleItems, setVisibleItems] = useState(0); // State for visible items
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(
    async (categoryId: number | null) => {
      setLoading(true);
      setSelectedCategory(categoryId);
      try {
        const products = categoryId
          ? await getProductsByCategoryId(categoryId)
          : await getProducts({ page: 1 });
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

  // Calculate visible items on mount and resize
  useEffect(() => {
    const updateVisibleItems = () => {
      if (typeof window !== "undefined") {
        const itemWidth = 150;
        const newVisibleItems = Math.floor((window.innerWidth - 100) / itemWidth);
        setVisibleItems(newVisibleItems);
      }
    };

    updateVisibleItems(); // Initial calculation
    window.addEventListener("resize", updateVisibleItems); // Update on resize

    return () => window.removeEventListener("resize", updateVisibleItems); // Cleanup
  }, []);

  const buttonVariants = {
    initial: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -2, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  const itemWidth = 150;
  const totalItems = categories.length + 1;
  const maxScroll = (totalItems - visibleItems) * itemWidth;

  const handleScrollLeft = () => {
    const newPosition = Math.max(scrollPosition - itemWidth * visibleItems, 0);
    setScrollPosition(newPosition);
  };

  const handleScrollRight = () => {
    const newPosition = Math.min(
      scrollPosition + itemWidth * visibleItems,
      maxScroll
    );
    setScrollPosition(newPosition);
  };

  return (
    <div className="w-full px-4 py-3">
      <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <h2 className="text-xl font-bold">Danh Mục Sản Phẩm</h2>
        <span className="text-gray-500 mt-2 sm:mt-0 cursor-pointer">
          Danh mục hàng đầu của tuần
        </span>
      </div>

      <div className="mt-2 flex items-center w-full">
        <button
          onClick={handleScrollLeft}
          disabled={scrollPosition === 0}
          className={ClassNames(
            "p-2 rounded-full",
            scrollPosition === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-200"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="overflow-hidden flex-1 w-full py-3">
          <motion.div
            ref={containerRef}
            className="flex gap-3 whitespace-nowrap"
            animate={{ x: -scrollPosition }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ minWidth: "max-content" }}
          >
            {[{ id: null, name: "Tất cả" }, ...categories].map(({ id, name }) => (
              <motion.div
                key={id ?? "all"}
                className={ClassNames(
                  "flex justify-center gap-2 items-center p-4 rounded-lg cursor-pointer transition-colors",
                  selectedCategory === id
                    ? "bg-primary text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:shadow-lg"
                )}
                style={{ width: `${itemWidth}px` }}
                onClick={() => fetchProducts(id)}
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <p className="font-medium text-sm text-center">{name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <button
          onClick={handleScrollRight}
          disabled={scrollPosition >= maxScroll}
          className={ClassNames(
            "p-2 rounded-full",
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