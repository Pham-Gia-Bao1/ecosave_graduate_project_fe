// ProductCategories.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/api";
import { Category, Product } from "@/types";

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
  const [itemWidth, setItemWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch products based on category
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

  // Initial fetch
  useEffect(() => {
    fetchProducts(null);
  }, [fetchProducts]);

  // Calculate visible items and item width dynamically
  useEffect(() => {
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      // iPhone 11 logical width is ~414px, adjust item width for mobile
      const newItemWidth = screenWidth < 640 ? 100 : 150;
      const newVisibleItems = Math.floor((screenWidth - 32) / newItemWidth); // 32px for padding
      setItemWidth(newItemWidth);
      setVisibleItems(newVisibleItems);
    };

    // Run on mount and resize
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Animation variants for buttons
  const buttonVariants = {
    initial: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -2, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  // Calculate max scroll
  const totalItems = categories.length + 1; // +1 for "Tất cả"
  const maxScroll = itemWidth ? (totalItems - visibleItems) * itemWidth : 0;

  // Scroll handlers
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <h2 className="text-lg sm:text-xl font-bold hidden sm:block">
          Danh Mục Sản Phẩm
        </h2>
        <span className="text-gray-500 mt-2 sm:mt-0 cursor-pointer text-sm">
          Danh mục hàng đầu của tuần
        </span>
      </div>

      {/* Slider */}
      <div className="mt-2 flex items-center w-full">
        {/* Left Arrow */}
        <motion.button
          onClick={handleScrollLeft}
          disabled={scrollPosition === 0}
          className={`p-2 rounded-full hidden sm:flex ${
            scrollPosition === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-200"
          }`}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>

        {/* Categories Slider */}
        <div className="flex-1 w-full py-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
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
                className={`flex justify-center items-center px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === id
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:shadow-lg"
                }`}
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

        {/* Right Arrow */}
        <motion.button
          onClick={handleScrollRight}
          disabled={scrollPosition >= maxScroll}
          className={`p-2 rounded-full hidden sm:flex ${
            scrollPosition >= maxScroll
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-200"
          }`}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};

export default ProductCategories;