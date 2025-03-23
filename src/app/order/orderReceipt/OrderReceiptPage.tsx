"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import api from "@/api";
import { createOrderItems } from "@/api/orders"; // Giả sử đây là API riêng
import { setTotalItems } from "@/redux/cartSlice";
import { RootState } from "@/redux/store";
import { PaymentItem, Store, OrderData } from "@/types";
import { formatCurrency, getCurrentDateTime } from "@/utils";
import getCookie from "@/utils/helpers/getCookie";
import { FileText } from "lucide-react";
import Link from "next/link";
import Loading from "@/app/loading";
import ToastNotification from "@/components/toast/ToastNotification";
import { removeTimeFromDate } from "@/utils/helpers/convertToVietnamTime";

// Định nghĩa lại OrderData với các thuộc tính cần thiết
interface ExtendedOrderData extends OrderData {
  id: number;
  order_code: string;
}

const OrderReceipt = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failure">(
    "success"
  );
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderCode, setOrderCode] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<PaymentItem[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    keyword: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  } | null>(null);

  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);

  // Helper để xóa cookie
  const clearCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Xử lý tạo đơn hàng
  const createOrder = useCallback(async () => {
    if (orderId) return;

    try {
      const params = new URLSearchParams(window.location.search);
      const responseCode = params.get("vnp_ResponseCode");
      const amount = Number(params.get("vnp_Amount")) / 100; // Chia cho 100 để lấy số tiền thực tế

      // Khi hiển thị, định dạng số
      const formattedAmount = new Intl.NumberFormat("vi-VN").format(amount) + " đ";
      setTotalAmount(formattedAmount); // Lưu giá trị số vào state
      console.log(formattedAmount);

      if (responseCode !== "00") {
        setPaymentStatus("failure");
        return;
      }

      const orderData = getCookie("orderData");
      if (!orderData) throw new Error("Không tìm thấy dữ liệu đơn hàng");
      console.log(orderData);

      const orderDataObject: OrderData = {
        ...JSON.parse(orderData),
        status: "pending",
      };
      const storeId = Number(orderDataObject.store_id || 1);
      const orderStore = await api.stores.getById(storeId);
      if (!orderStore) throw new Error("Không tìm thấy cửa hàng");

      setStore(orderStore);
      document.cookie = `storeLocation=${encodeURIComponent(
        JSON.stringify([orderStore.latitude, orderStore.longitude])
      )}; path=/; secure`;

      const orderItems = getCookie("orderItems");
      if (orderItems) setSelectedItems(JSON.parse(orderItems));

      const newOrder = (await api.orders.create(
        orderDataObject
      )) as ExtendedOrderData;
      if (!newOrder) throw new Error("Tạo đơn hàng thất bại");

      setOrderCode(newOrder.order_code);
      setOrderId(newOrder.id);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";
      setToast({ message: `Lỗi: ${errorMessage}`, keyword: "ERROR" });
    } finally {
      setLoading(false);
      clearCookie("orderData");
      clearCookie("orderItems");
      router.replace(window.location.pathname);
    }
  }, [orderId, router]);

  // Xử lý order items và cập nhật giỏ hàng
  const processOrderItems = useCallback(async () => {
    if (!orderId || !selectedItems.length || !store?.id) return;

    try {
      const orderItems = selectedItems.map((item) => ({
        product_id: item.id,
        quantity: Number(item.quantity),
        price:
          typeof item.price === "string"
            ? parseFloat(item.price.replace(/[^\d.-]/g, ""))
            : item.price,
      }));

      await createOrderItems(orderId, orderItems);
      await Promise.all(
        selectedItems.map((item) => api.cart.remove(store.id, item.id))
      );

      const cartData = await api.cart.getDetail(store.id);
      const items = cartData?.data?.store?.items ?? [];
      dispatch(setTotalItems(items.length));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";
      setToast({ message: `Lỗi: ${errorMessage}`, keyword: "ERROR" });
    }
  }, [orderId, selectedItems, store?.id, dispatch]);

  // Gọi các effect
  useEffect(() => {
    createOrder();
  }, [createOrder]);

  useEffect(() => {
    processOrderItems();
  }, [processOrderItems]);

  // Toggle modal
  const toggleModal = () => setIsModalOpen((prev) => !prev);

  if (loading) return <Loading />;

  return (
    <div className="flex justify-center items-center min-h-[600px]">
      {toast && (
        <ToastNotification message={toast.message} keyword={toast.keyword} />
      )}
      <div
        className={`bg-white p-8 rounded-xl relative text-center border border-gray-300 ${
          paymentStatus === "failure" ? "bg-red-100" : "bg-green-100"
        }`}
      >
        {paymentStatus !== "failure" && (
          <button
            onClick={toggleModal}
            className="absolute right-2 top-2 flex items-center justify-center space-x-2 p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 transition duration-300"
          >
            <p>Hóa đơn</p>
            <FileText className="w-5 h-5" />
          </button>
        )}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 flex items-center justify-center rounded-full ${
              paymentStatus === "failure" ? "bg-red-200" : "bg-green-100"
            }`}
          >
            {paymentStatus === "failure" ? (
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
        <h1
          className={`text-2xl font-bold ${
            paymentStatus === "failure" ? "text-red-600" : "text-green-600"
          } mb-2`}
        >
          {paymentStatus === "failure"
            ? "Thanh toán thất bại"
            : "Thanh toán thành công"}
        </h1>
        <p className="text-gray-600 mb-6">
          {paymentStatus === "failure"
            ? "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại."
            : "Đơn hàng của quý khách đã thanh toán thành công. Vui lòng đến cửa hàng sớm nhất trong vòng 24h để nhận sản phẩm"}
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/products">
            <button className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-600 rounded-lg">
              Tiếp tục mua sắm
            </button>
          </Link>
          {paymentStatus !== "failure" && (
            <Link href="/map/direction">
              <button className="px-6 py-2 bg-primary text-white hover:bg-primary-light rounded-lg">
                Xem đường đi đến cửa hàng
              </button>
            </Link>
          )}
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-full max-w-md relative flex flex-col max-h-[90vh]">
            <header className="p-4 border-b border-gray-200 text-center sticky top-0 bg-white z-10">
              <h1 className="text-3xl font-extrabold tracking-wide">
                Eco<span className="text-primary">Save</span>
              </h1>
              <h2 className="text-xl font-semibold mt-2">HÓA ĐƠN LẤY HÀNG</h2>
            </header>
            <div className="p-4 overflow-y-auto flex-grow">
              <section className="mb-4 text-sm space-y-2">
                <p>
                  <span className="font-semibold">Mã đơn hàng: </span>
                  {orderCode || "ECOSAVE99734636"}
                </p>
                <p>
                  <span className="font-semibold">Tên khách hàng: </span>
                  {user?.username || "Gia Bao"}
                </p>
                <p>
                  <span className="font-semibold">Tên cửa hàng: </span>
                  {store?.store_name || "Winmart Đà Nẵng"}
                </p>
                <p>
                  <span className="font-semibold">Địa chỉ lấy hàng: </span>
                  {store?.address || "101B Lê Hữu Trác, Đà Nẵng"}
                </p>
                <p>
                  <span className="font-semibold">Ngày mua: </span>
                  {removeTimeFromDate(getCurrentDateTime())}
                </p>
              </section>
              <table className="w-full text-sm border-t border-b border-gray-300">
                <thead>
                  <tr className="text-left font-semibold border-b border-gray-300 bg-gray-100">
                    <th className="py-2 px-2">Mặt hàng</th>
                    <th className="py-2 px-2 text-right">Đơn giá</th>
                    <th className="py-2 px-2 text-right">Số lượng</th>
                    <th className="py-2 px-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item, index) => {
                    const numericPrice =
                      typeof item.price === "string"
                        ? parseFloat(
                            item.price.replace(/\./g, "").replace(",", ".")
                          )
                        : item.price;
                    const total = numericPrice * Number(item.quantity);
                    return (
                      <tr
                        key={index}
                        className="border-b border-dashed border-gray-200"
                      >
                        <td className="py-2 px-2">{item.name}</td>
                        <td className="py-2 px-2 text-right">
                          {formatCurrency(numericPrice)}
                        </td>
                        <td className="py-2 px-2 text-right">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-2 text-right">
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="text-right mt-4 text-sm space-y-2">
                <p>
                  <span className="font-semibold">TỔNG TIỀN T.TOÁN: </span>
                  {totalAmount}
                </p>
                <p>
                  <span className="font-semibold">TIỀN KHÁCH TRẢ: </span>
                  {totalAmount}
                </p>
                <p className="text-xs text-gray-500">
                  Điểm tích lũy (10.000đ = 1 điểm): 8.9
                </p>
              </div>
            </div>
            <footer className="p-4 border-t border-gray-200 text-center text-xs text-gray-500 sticky bottom-0 bg-white">
              www.ecosave.space
            </footer>
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-red-500 z-50 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderReceipt;
