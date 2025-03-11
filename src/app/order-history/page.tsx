"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getUserOrders } from "@/api"
import type { OrderData } from "@/types" 
import { formatMoney } from "@/utils"

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await getUserOrders()

        if (response && response.status === "success" && response.data) {
          // Chuyển đổi cấu trúc dữ liệu từ API sang định dạng phẳng để hiển thị
          const flattenedOrders: OrderData[] = []

          // Lặp qua từng cửa hàng
          Object.values(response.data).forEach((storeData) => {
            // Lặp qua từng đơn hàng trong cửa hàng
            storeData.orders.forEach((order) => {
              flattenedOrders.push({
                ...order,
                store_id: storeData.store_id,
                store_name: storeData.store_name,
                total_price: Number.parseFloat(order.total_price),
                order_date: new Date(order.order_date),
              })
            })
          })

          setOrders(flattenedOrders)
        } else {
          setError("Không thể tải dữ liệu đơn hàng")
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const calculateDiscount = (order) => {
    return order.items.reduce((totalDiscount, item) => {
      const originalPrice = item.original_price * item.quantity;
      const discountedPrice = item.unique_price * item.quantity;
      return totalDiscount + (originalPrice - discountedPrice);
    }, 0);
  };

  // Map status code to display text
  const getStatusDisplay = (status: "pending | completed" | "cancelled") => {
    if (status === "completed") {
      return "Đã nhận hàng thành công"
    } else if (status === "pending") {
      return "Đang chờ bạn đến lấy hàng"
    } else if (status === "cancelled") {
      return "Đã hủy"
    }
    return "Không xác định"
  }

  // Get status style based on status
  const getStatusStyle = (status: "pending | completed" | "cancelled") => {
    if (status === "completed") {
      return "bg-green-100 text-green-800"
    } else if (status === "pending") {
      return "bg-yellow-100 text-yellow-800"
    } else if (status === "cancelled") {
      return "bg-red-100 text-red-800"
    }
    return ""
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-8 text-center">LỊCH SỬ ĐƠN HÀNG</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-8 text-center">LỊCH SỬ ĐƠN HÀNG</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Không thể tải lịch sử đơn hàng, vui lòng quay lại sau! </strong>
          {/* <span className="block sm:inline">{error}</span> */}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl font-bold mb-8 text-center">LỊCH SỬ ĐƠN HÀNG</h1>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-8 text-center">LỊCH SỬ ĐƠN HÀNG</h1>

      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.order_id} className="border rounded-lg shadow-sm overflow-hidden bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Header */}
              <div className="p-6 md:col-span-3 bg-gray-50 border-b">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{order.store_name}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{order.order_date.toLocaleDateString("vi-VN")}</p>
                    <p className="text-sm text-gray-500">Mã đơn: #{order.order_code}</p>
                  </div>
                  <div className="w-full md:w-auto">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}>
                      {getStatusDisplay(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-6 md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Chi tiết đơn hàng</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.product_id} className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={item.product_image[0] || "/placeholder.svg?height=60&width=60"}
                          alt={item.product_name}
                          width={60}
                          height={60}
                          className="rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatMoney(item.unique_price)}</div>
                        {/* <div className="font-medium">{formatMoney(item.sub_price)}</div> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary and Actions */}
              <div className="p-6 bg-gray-50 border-l">
                <h3 className="text-lg font-semibold mb-4">Tổng quan</h3>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span>Tổng tiền hàng:</span>
                    <span>{formatMoney(order.total_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số tiền tiết kiệm được:</span>
                    <span>{formatMoney(calculateDiscount(order))}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Thành tiền:</span>
                    <span>{formatMoney(order.total_price)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {order.status === "completed" ? (
                    <button className="w-full py-2 px-4 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 transition-colors">
                      Đánh giá
                    </button>
                  ) : (
                    <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
                      Xem đường đi đến cửa hàng
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
