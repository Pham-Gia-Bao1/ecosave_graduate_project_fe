import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
    addToWishlist,
    removeFromWishlist,
    fetchWishlist,
    setWishlistProductIds,
} from "@/redux/wishlistSlice";
import { WishList, Product } from "@/types";
import api from "@/api";
import { setTotalItems } from "@/redux/cartSlice";

export const useWishlist = () => {
    const dispatch = useDispatch<AppDispatch>();
    const wishlist = useSelector((state: RootState) => state.wishlist.items);
    const wishlistProductIds = useSelector((state: RootState) => state.wishlist.productIds);
    const loading = useSelector((state: RootState) => state.wishlist.loading);
    const [loadingState, setLoadingState] = useState<{ [key: number]: boolean }>({});
    const TOAST_DURATION = 3000;
    const [toast, setToast] = useState<{ message: string; keyword: "SUCCESS" | "ERROR" } | null>(null);

    useEffect(() => {
        dispatch(fetchWishlist());
    }, [dispatch]);

    useEffect(() => {
        const fetchWishlistIds = async () => {
            try {
                const productIds = await api.wishlist.getProductIds();
                dispatch(setWishlistProductIds(productIds));
            } catch (error) {
                console.error("Lỗi khi lấy danh sách product_id:", error);
            }
        };
        fetchWishlistIds();
    }, [dispatch]);

    const showToast = (message: string, keyword: "SUCCESS" | "ERROR") => {
        setToast({ message, keyword });
        setTimeout(() => setToast(null), TOAST_DURATION);
    };

    const handleAddToWishlist = async (item: WishList) => {
        setLoadingState((prev) => ({ ...prev, [item.product_id]: true }));
        try {
            await api.wishlist.add(item.product_id); // Gọi API trước
            dispatch(addToWishlist(item)); // Chỉ dispatch nếu API thành công
            showToast("Đã thêm vào danh sách yêu thích", "SUCCESS");
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            showToast("Lỗi khi thêm sản phẩm", "ERROR");
        } finally {
            setLoadingState((prev) => ({ ...prev, [item.product_id]: false }));
        }
    };

    const handleRemove = async (id: number) => {
        setLoadingState((prev) => ({ ...prev, [id]: true }));
        try {
            await api.wishlist.remove(id); // Gọi API trước
            dispatch(removeFromWishlist(id)); // Chỉ dispatch nếu API thành công
            showToast("Đã xóa khỏi danh sách yêu thích", "SUCCESS");
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            showToast("Lỗi khi xóa sản phẩm", "ERROR");
        } finally {
            setLoadingState((prev) => ({ ...prev, [id]: false }));
        }
    };

    const handleAddToCart = useCallback(async (product: Product) => {
        setLoadingState(prev => ({ ...prev, [product.id]: true }));

        try {
            const result = await api.cart.add(product.id, 1);
            if (result.success) {
                showToast(`Đã thêm ${product.name} vào giỏ hàng`, "SUCCESS");
                return true; // Đánh dấu thành công
            }
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            showToast(`Lỗi khi thêm ${product.name} vào giỏ hàng`, "ERROR");
        } finally {
            setLoadingState(prev => ({ ...prev, [product.id]: false }));
        }
        return false; // Đánh dấu thất bại
    }, []);

    const handleAddAllToCart = async () => {
        setLoadingState(prev =>
            wishlist.reduce((acc, item) => ({ ...acc, [item.product.id]: true }), prev)
        );

        const results = await Promise.all(
            wishlist.map(item => handleAddToCart(item.product))
        );

        setLoadingState(prev =>
            wishlist.reduce((acc, item) => ({ ...acc, [item.product.id]: false }), prev)
        );

        if (results.some(success => success)) {
            const cart = await api.cart.get();
            dispatch(setTotalItems(cart.data.total_items));
        }
    };


    return {
        wishlist,
        wishlistProductIds,
        loading,
        handleAddToWishlist,
        handleRemove,
        handleAddToCart,
        handleAddAllToCart,
        toast,
        loadingState,
    };
};