"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "@/api";
import { setTotalItems } from "@/redux/cartSlice";
const useCart = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.cart.get();
        if (response.status === "success") {
          dispatch(setTotalItems(response.data.total_items || 0));
        } else {
          setError(response.message || "Failed to fetch cart data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [dispatch]);
  return { loading, error };
};
export default useCart;
