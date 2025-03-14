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
import {
    addToWishlist as addAPI,
    addToCart,
    getCart,
    removeFromWishlist as removeAPI,
    getWishlistProductIds,
} from "@/api";
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
                const productIds = await getWishlistProductIds();
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
        dispatch(addToWishlist(item));
        try {
            await addAPI(item.product_id);
            showToast("Đã thêm vào danh sách yêu thích", "SUCCESS");
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            showToast("Lỗi khi thêm sản phẩm", "ERROR");
        }
        setLoadingState((prev) => ({ ...prev, [item.product_id]: false }));
    };

    const handleRemove = async (id: number) => {
        setLoadingState((prev) => ({ ...prev, [id]: true }));
        dispatch(removeFromWishlist(id));
        try {
            await removeAPI(id);
            showToast("Đã xóa khỏi danh sách yêu thích", "SUCCESS");
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            showToast("Lỗi khi xóa sản phẩm", "ERROR");
        }
        setLoadingState((prev) => ({ ...prev, [id]: false }));
    };

    const handleAddToCart = useCallback(async (product: Product) => {
        setLoadingState((prev) => ({ ...prev, [product.id]: true }));
        try {
            const result = await addToCart(product.id, 1);
            if (result.success) {
                const cart = await getCart();
                dispatch(setTotalItems(cart.data.total_items));
                showToast("Đã thêm vào giỏ hàng", "SUCCESS");
            }
        } catch (error) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            showToast("Lỗi khi thêm vào giỏ hàng", "ERROR");
        }
        setLoadingState((prev) => ({ ...prev, [product.id]: false }));
    }, [dispatch]);

    const handleAddAllToCart = async () => {
        for (const item of wishlist) {
            await handleAddToCart(item.product);
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