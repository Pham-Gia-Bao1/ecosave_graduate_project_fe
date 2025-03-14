import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { WishList } from "@/types";
import { getWishlist } from "@/api";

interface WishlistState {
    items: WishList[];
    productIds: number[]; // Thêm state lưu danh sách product_id
    loading: boolean;
}

const initialState: WishlistState = {
    items: [],
    productIds: [],
    loading: false,
};

// Fetch danh sách wishlist
export const fetchWishlist = createAsyncThunk("wishlist/fetchWishlist", async () => {
    const response = await getWishlist();
    return response.data;
});

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        addToWishlist: (state, action: PayloadAction<WishList>) => {
            state.items.push(action.payload);
        },
        removeFromWishlist: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        setWishlistProductIds: (state, action: PayloadAction<number[]>) => {
            state.productIds = action.payload; // Lưu danh sách product_id
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchWishlist.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { addToWishlist, removeFromWishlist, setWishlistProductIds } = wishlistSlice.actions;
export default wishlistSlice.reducer;
