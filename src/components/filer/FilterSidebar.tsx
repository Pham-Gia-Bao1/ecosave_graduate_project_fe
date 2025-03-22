import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useReducer,
  useRef,
} from "react";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Category, Product, ProductFilters } from "@/types";
import api from "@/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import { getUserLocation } from "@/utils/helpers/getUserLocation";
interface FilterSidebarProps {
  setProducts: (products: Product[]) => void;
  allProducts: Product[];
  categories: Category[];
  setLoading: (loading: boolean) => void;
}
const initialState = {
  selectedCategories: [] as number[],
  selectedRating: null as number | null,
  priceRange: [10000, 1000000] as [number, number],
  expiryDate: "",
  distance: 10,
  useDistanceFilter: false, // Thêm state để kiểm soát khi nào dùng khoảng cách
};
type Action =
  | { type: "SET_CATEGORIES"; payload: number[] }
  | { type: "SET_RATING"; payload: number | null }
  | { type: "SET_PRICE"; payload: [number, number] }
  | { type: "SET_EXPIRY"; payload: string }
  | { type: "SET_DISTANCE"; payload: number }
  | { type: "SET_USE_DISTANCE"; payload: boolean }
  | { type: "RESET" };
const filterReducer = (state: typeof initialState, action: Action) => {
  switch (action.type) {
    case "SET_CATEGORIES":
      return { ...state, selectedCategories: action.payload };
    case "SET_RATING":
      return { ...state, selectedRating: action.payload };
    case "SET_PRICE":
      return { ...state, priceRange: action.payload };
    case "SET_EXPIRY":
      return { ...state, expiryDate: action.payload };
    case "SET_DISTANCE":
      return { ...state, distance: action.payload, useDistanceFilter: true };
    case "SET_USE_DISTANCE":
      return { ...state, useDistanceFilter: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};
export default function FilterSidebar({
  setProducts,
  allProducts,
  categories,
  setLoading,
}: FilterSidebarProps) {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId;
  const store_id = storeId ? parseInt(storeId as string) : undefined;
  const [state, dispatch] = useReducer(filterReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  // Lấy userLocation khi component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const location = getUserLocation();
      setUserLocation(location);
    }
  }, []);
  const applyFilters = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setLoading(true);
    try {
      const filters: ProductFilters = {
        store_id,
        category_id: state.selectedCategories.length
          ? state.selectedCategories
          : undefined,
        rating: state.selectedRating ?? undefined,
        min_price: state.priceRange[0] ?? undefined,
        max_price: state.priceRange[1] ?? undefined,
        expiration_date: state.expiryDate || undefined,
        ...(state.useDistanceFilter &&
          userLocation && {
            distance: parseFloat(state.distance.toString()),
            user_lat: userLocation[0], // Lấy giá trị từ mảng userLocation
            user_lng: userLocation[1], // Lấy giá trị từ mảng userLocation
          }),
      };
      const filteredProducts = await api.products.getList(filters, {
        signal: abortControllerRef.current.signal,
      });
      setProducts(filteredProducts);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Filter error:", error);
        setProducts(allProducts);
      }
    } finally {
      setLoading(false);
    }
  }, [state, store_id, setLoading, setProducts, allProducts, userLocation]);
  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET" });
    setProducts(allProducts);
  }, [setProducts, allProducts]);
  useEffect(() => {
    const timer = setTimeout(applyFilters, 300);
    return () => clearTimeout(timer);
  }, [applyFilters]);
  const ratingOptions = useMemo(() => [5, 4, 3, 2, 1], []);
  return (
    <aside className="w-full lg:w-[250px] space-y-6 border-r pr-4">
      <div>
        <h3 className="font-semibold mb-4">Loại sản phẩm</h3>
        <div className="space-y-2 max-h-96 overflow-auto">
          {categories?.length ? (
            categories.map((type) => (
              <div
                key={type.id}
                className="flex items-center space-x-2 cursor-pointer hover:bg-primary"
              >
                <Checkbox
                  id={type.name.toLowerCase()}
                  checked={state.selectedCategories.includes(type.id)}
                  onCheckedChange={() =>
                    dispatch({
                      type: "SET_CATEGORIES",
                      payload: state.selectedCategories.includes(type.id)
                        ? state.selectedCategories.filter((c) => c !== type.id)
                        : [...state.selectedCategories, type.id],
                    })
                  }
                />
                <label
                  htmlFor={type.name.toLowerCase()}
                  className="text-sm cursor-pointer"
                >
                  {type.name}
                </label>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Không có loại sản phẩm nào</p>
          )}
        </div>
      </div>
      <div>
        <h3 className="mb-4">Đánh giá</h3>
        <div className="space-y-2">
          {ratingOptions.map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <input
                className="w-5 h-5 border border-gray-400 rounded-full checked:bg-primary checked:border-primary focus:ring-primary"
                type="radio"
                id={`rating-${rating}`}
                name="rating"
                checked={state.selectedRating === rating}
                onChange={() =>
                  dispatch({ type: "SET_RATING", payload: rating })
                }
              />
              <label
                htmlFor={`rating-${rating}`}
                className="text-sm flex items-center cursor-pointer"
              >
                {Array.from({ length: rating }).map((_, index) => (
                  <Star
                    key={index}
                    className="w-5 h-5 m-1 fill-yellow-400"
                    stroke="none"
                  />
                ))}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-4">Khoảng giá</h3>
        <Slider
          value={state.priceRange}
          onValueChange={(value) => {
            if (value.length === 2) {
              dispatch({ type: "SET_PRICE", payload: [value[0], value[1]] });
            }
          }}
          max={1000000}
          step={10000}
          className="w-full"
        />

        <div className="flex justify-between mt-2 text-sm">
          <span>{state.priceRange[0].toLocaleString()}đ</span>
          <span>{state.priceRange[1].toLocaleString()}đ</span>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-4">Ngày hết hạn</h3>
        <input
          type="date"
          value={state.expiryDate}
          onChange={(e) =>
            dispatch({ type: "SET_EXPIRY", payload: e.target.value })
          }
          className="w-full border rounded-lg p-2"
        />
      </div>
      <div>
        <h3 className="font-semibold mb-4">Khoảng cách (km)</h3>
        <Slider
          value={[state.distance]}
          onValueChange={(value) =>
            dispatch({ type: "SET_DISTANCE", payload: value[0] })
          }
          max={20}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="text-sm mt-2">{state.distance} km</div>
      </div>
      <button
        onClick={resetFilters}
        className="w-full bg-gray-300 text-black py-2 rounded-lg font-semibold mt-2"
      >
        Đặt lại bộ lọc
      </button>
    </aside>
  );
}
