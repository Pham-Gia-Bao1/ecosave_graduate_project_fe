"use client";
import { useParams } from "next/navigation";
import { getCartDetail, updateCartItemQuantity, removeCartItem } from "@/api";
import React, { useEffect, useState, useCallback } from "react";
import { debounce } from "lodash";
import type { CartProduct, PaymentItem } from "@/types";
import { DeliveryAddress } from "@/components/cart/DeliveryAddress";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { ShoppingCart, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { addPaymentItem, clearPaymentItems } from "@/redux/paymentSlice";
import Loading from "@/app/loading";
const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [cartData, setCartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const storeId =
    params?.storeId && !isNaN(parseInt(params.storeId as string))
      ? parseInt(params.storeId as string)
      : null;
  const debouncedUpdateQuantity = debounce(
    async (storeId: number, productId: number, newQuantity: number) => {
      try {
        await updateCartItemQuantity(storeId, productId, newQuantity);
      } catch (error) {
        console.error("Failed to update quantity:", error);
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.product_id === productId
              ? { ...item, quantity: item.quantity }
              : item
          )
        );
        setError("Không thể cập nhật số lượng. Vui lòng thử lại.");
      }
    },
    500
  );
  const handleQuantityChange = useCallback(
    (productId: number, newQuantity: number) => {
      if (!storeId) return;
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product_id === productId
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: newQuantity * Number(item.discounted_price),
              }
            : item
        )
      );
      debouncedUpdateQuantity(storeId, productId, newQuantity);
    },
    [storeId, debouncedUpdateQuantity]
  );
  const handleRemoveItem = useCallback(
    async (productId: number) => {
      if (!storeId) return;
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product_id === productId ? { ...item, isRemoving: true } : item
        )
      );
      try {
        await removeCartItem(storeId, productId);
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.product_id !== productId)
        );
      } catch (error) {
        console.error("Failed to remove item:", error);
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.product_id === productId
              ? { ...item, isRemoving: false }
              : item
          )
        );
        setError("Không thể xóa sản phẩm. Vui lòng thử lại.");
      }
    },
    [storeId]
  );
  const fetchCart = useCallback(async () => {
    if (!storeId) {
      setError("Store ID không hợp lệ.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const cartData = await getCartDetail(storeId);
      setCartData(cartData.data);
      const items = cartData.data?.store?.items ?? [];
      setCartItems(items);
      if (items.length === 0) {
        setError("Giỏ hàng trống.");
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải giỏ hàng. Vui lòng thử lại sau.");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]); // ✅ `useCallback` ensures `fetchCart` is stable
  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // ✅ No ESLint warnings now
  const calculateTotal = () =>
    cartItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const calculateSavings = () =>
    cartItems.reduce(
      (sum, item) =>
        sum +
        (Number(item.original_price) * item.quantity - Number(item.subtotal)),
      0
    );
  const handlePayment = async () => {
    cartItems.forEach((product) => {
      const paymentProductItem: PaymentItem = {
        id: product.product_id,
        name: product.name,
        price: product.discounted_price,
        quantity: product.quantity,
        picture: product.images[0].image_url,
        storeId: storeId ?? 1,
      };
      dispatch(clearPaymentItems());
      dispatch(addPaymentItem(paymentProductItem));
    });
    router.push("/checkout");
  };
  if (loading) {
    return (
      <Loading />
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-500 mb-4 text-xl font-semibold">{error}</p>
        <button
          onClick={() => fetchCart()}
          className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-8 rounded-full transition-colors duration-300 shadow-lg text-lg font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold mb-8 text-gray-800 flex items-center">
          <ShoppingCart className="mr-3" /> Chi tiết giỏ hàng
        </h1>
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <DeliveryAddress
                storeLatitude={cartData?.store?.store_latitude || ""}
                storeLongitude={cartData?.store?.store_longitude || ""}
                storeAddress={cartData?.store?.store_address || ""}
                userAddress={cartData?.user?.address || ""}
                onChangeAddress={() => console.log("Change address")}
              />
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.product_id}
                    product={item}
                    onRemove={handleRemoveItem}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <CartSummary
                total={calculateTotal()}
                savings={calculateSavings()}
                handlePayment={handlePayment}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-lg">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <p className="text-2xl text-gray-600 mb-8">
              Giỏ hàng của bạn đang trống.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white py-3 px-8 rounded-full transition-colors duration-300 text-lg font-medium"
            >
              <ArrowLeft className="mr-2" /> Tiếp tục mua sắm
            </Link>
          </div>
        )}
      </div>
    </div>
    
  );
};
export default CartPage;
