// redux/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isLogin: boolean;
  user: any | null; // Thay bằng type UserProfile nếu bạn có
  loading: boolean; // Thêm trạng thái loading
}

const initialState: AuthState = {
  isLogin: false,
  user: null,
  loading: true, // Ban đầu là true vì chưa kiểm tra xong
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState(state, action) {
      state.isLogin = action.payload.isLogin;
      state.user = action.payload.user;
      state.loading = false; // Đánh dấu kiểm tra xong
    },
    logout(state) {
      state.isLogin = false;
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setAuthState, logout } = authSlice.actions;
export default authSlice.reducer;