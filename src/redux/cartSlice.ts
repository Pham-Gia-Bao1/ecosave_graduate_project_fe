import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface CartState {
  totalItems: number;
}

const initialState: CartState = {
  totalItems: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setTotalItems: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload;
    },
    increment: (state) => {
      state.totalItems += 1;
    },
    decrement: (state) => {
      if (state.totalItems > 0) {
        state.totalItems -= 1;
      }
    },
  },
});

export const { setTotalItems, increment, decrement } = cartSlice.actions;
export const getTotalItems = (state: RootState) => state.cart.totalItems;

export default cartSlice.reducer;