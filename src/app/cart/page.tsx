"use client"

import { getCart } from "@/api";
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCartIcon as CartIcon, MapPin, Package, Loader2 } from "lucide-react"
import { useDispatch } from "react-redux";
import { setTotalItems } from "@/redux/cartSlice";
import Loading from "../loading";

interface CartItem {
  product_id: number
  product_name: string
  quantity: number
  original_price: string
  price: string
  subtotal: number
  images: Array<{
    id: number
    product_id: number
    image_url: string
    image_order: number
  }>
}

interface StoreCartItem {
  store_id: number
  store_name: string
  store_address: string
  store_latitude: string
  store_longitude: string
  total_items_per_store: number
  total_products_per_store: number
  total_amount: number
  items: CartItem[]
}

interface CartData {
  cart_id: number
  user: {
    id: number
    name: string
    email: string
  }
  total_items: number
  total_products: number
  stores: Record<string, StoreCartItem>
}

const ShoppingCart: React.FC = () => {
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await getCart()

        if (response.status === "success") {
          setCartData(response.data)
          dispatch(setTotalItems(response.data.length));
        } else {
          setError(response.message || "Failed to fetch cart data")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [dispatch])

  const getFirstImage = (items: CartItem[]): string => {
    if (items[0]?.images?.length > 0) {
      return items[0].images[0].image_url
    }
    return "/placeholder.svg"
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-center h-64">
        {/* <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /> */}
        <Loading />
        <span className="ml-2 text-gray-600">Đang tải giỏ hàng...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
          <Link
            href="/products"
            className="mt-4 inline-block bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    )
  }

  const hasItems = cartData && Object.keys(cartData.stores || {}).length > 0

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex items-center p-4 sm:p-6 border-b">
          <CartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mr-2 sm:mr-3" />
          <h1 className="text-xl sm:text-xl text-gray-800">Giỏ hàng của bạn</h1>
          {hasItems && (
            <div className="ml-auto text-sm text-gray-500">
              Tổng cộng: <span className="font-medium">{cartData?.total_items || 0}</span> sản phẩm
            </div>
          )}
        </div>

        {!hasItems ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 text-lg sm:text-xl mb-4">Giỏ hàng trống</div>
            <Link
              href="/products"
              className="bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm sm:text-base"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {Object.values(cartData?.stores || {}).map((store) => (
              <div
                key={store.store_id}
                className="bg-gray-50 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 hover:shadow-md transition-shadow min-h-[150px]"
              >
                <div className="flex-shrink-0 w-full sm:w-24 h-32 sm:h-24 relative rounded-md overflow-hidden border border-gray-200">
                  <Image src={getFirstImage(store.items)} alt={store.store_name} fill className="object-cover" />
                </div>

                <div className="flex-grow w-full flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="min-w-0 flex-grow"> {/* Thay đổi đây */}
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">{store.store_name}</h3>
                      <div className="flex items-center mt-1 text-gray-600">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <p className="text-sm lg:text-base whitespace-nowrap overflow-hidden text-ellipsis">{store.store_address}</p>
                      </div>
                    </div>

                    <div className="flex sm:ml-auto items-center gap-4 sm:gap-6">
                      <div className="flex items-center text-gray-700 text-sm lg:text-base whitespace-nowrap">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="font-medium">{store.total_products_per_store}</span> <span className="ml-1">loại sản phẩm</span>
                      </div>
                      <div className="text-gray-700 font-medium text-sm lg:text-base whitespace-nowrap">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(store.total_amount)}
                      </div>
                      <Link
                        href={`/cart/${store.store_id}`}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <div className="text-gray-600">
                Tổng số loại sản phẩm: <span className="font-medium">{cartData?.total_products}</span>
              </div>
              <Link
                href="/products"
                className="bg-emerald-50 text-emerald-700 px-3 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-emerald-100 transition-colors flex items-center font-medium text-sm lg:text-base whitespace-nowrap"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart;