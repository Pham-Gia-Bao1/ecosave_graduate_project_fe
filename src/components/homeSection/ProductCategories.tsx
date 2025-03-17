import { getProducts, getProductsByCategoryId } from "@/api";
import { Category, Product } from "@/types";
import React, { useState, useCallback, useEffect } from "react";
import ClassNames from "classnames";

import { ShoppingCart, Utensils,Fish, Egg, Apple, Snowflake, Wrench, Droplets, Wheat, Package, Milk, Box } from "lucide-react";
interface ProductCategoriesProps {
  categories: Category[];
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
}


const getCategoryIcon = (categoryName: string) => {
  const icons: Record<string, JSX.Element> = {
    "Tất cả": <ShoppingCart className="w-6 h-6 text-gray-600" />,
    "Thịt": <Utensils className="w-6 h-6 text-gray-600" />,
    "Thủy sản": <Fish className="w-6 h-6 text-gray-600" />,
    "Trứng": <Egg className="w-6 h-6 text-gray-600" />,
    "Trái Cây": <Apple className="w-6 h-6 text-gray-600" />,
    "Thực Phẩm Đông Lạnh": <Snowflake className="w-6 h-6 text-gray-600" />,
    "Thực Phẩm Sơ Chế": <Wrench className="w-6 h-6 text-gray-600" />,
    "Dầu Ăn, Gia vị": <Droplets className="w-6 h-6 text-gray-600" />,
    "Gạo, Mì, Bún, Đậu": <Wheat className="w-6 h-6 text-gray-600" />,
    "Thực Phẩm khô": <Package className="w-6 h-6 text-gray-600" />,
    "Chế Phẩm Từ Sữa": <Milk className="w-6 h-6 text-gray-600" />,
  };

  return icons[categoryName] || <Box className="w-6 h-6 text-gray-600" />;
};


const ProductCategories: React.FC<ProductCategoriesProps> = ({
  categories,
  setProducts,
  setLoading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const fetchProducts = useCallback(
    async (categoryId: number | null) => {
      console.log(categories)
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

  return (
    <div className="w-full px-4 py-3">
      <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <h2 className="text-xl font-bold">Danh Mục Sản Phẩm</h2>
        <span className="text-gray-500 mt-2 sm:mt-0 cursor-pointer">
          Danh mục hàng đầu của tuần
        </span>
      </div>

      <div className="mt-2 overflow-x-auto max-h-80">
        <div className="flex gap-3 overflow-x-auto scrollbar-container py-3">
          {[{ id: null, name: "Tất cả" }, ...categories].map(({ id, name }) => (
            <div
              key={id ?? "all"}
              className={ClassNames(
                "flex-shrink-0 flex justify-center gap-2 items-center p-4 rounded-lg cursor-pointer transition",
                selectedCategory === id ? "bg-primary text-white shadow-lg" : "bg-gray-100 hover:shadow-lg"
              )}
              onClick={() => fetchProducts(id)}
            >
              {getCategoryIcon(name)}
              <p className="text-gray-700 font-medium text-sm text-center">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCategories;
