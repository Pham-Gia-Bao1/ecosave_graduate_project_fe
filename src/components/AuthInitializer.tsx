// components/AuthInitializer.tsx
"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store"; // Import RootState
import { setAuthState } from "@/redux/authSlice"; // Import action từ authSlice

// Giả định bạn có một hàm API để lấy thông tin user
const fetchUserInfo = async (token: string) => {
  const response = await fetch("/api/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch user info");
  return response.json();
};

const AuthInitializer: React.FC = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth); // Lấy user và loading từ Redux

  useEffect(() => {
    const initializeAuth = async () => {
      // Kiểm tra xem có access_token trong cookie không
      const isLogin = typeof window !== "undefined" && document.cookie.includes("access_token");

      if (isLogin && !user && loading) {
        // Nếu đã đăng nhập nhưng chưa có thông tin user, gọi API
        const token = localStorage.getItem("access_token"); // Hoặc lấy từ cookie nếu bạn lưu ở đó
        if (token) {
          try {
            const userInfo = await fetchUserInfo(token);
            console.log("User info fetched:", userInfo);
            dispatch(setAuthState({ isLogin: true, user: userInfo }));
          } catch (error) {
            console.error("Error fetching user info:", error);
            // Nếu lỗi, có thể coi như chưa đăng nhập
            dispatch(setAuthState({ isLogin: false, user: null }));
          }
        } else {
          // Không có token, cập nhật trạng thái là chưa đăng nhập
          dispatch(setAuthState({ isLogin: false, user: null }));
        }
      } else {
        // Nếu không có cookie hoặc đã có user, cập nhật trạng thái dựa trên cookie
        dispatch(setAuthState({ isLogin, user: user || null }));
      }
    };

    initializeAuth();
  }, [dispatch, user, loading]); // Thêm user và loading vào dependency array

  return null; // Không render gì cả
};

export default AuthInitializer;