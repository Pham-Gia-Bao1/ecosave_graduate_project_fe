"use client";
import React, { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import LoginWithGoogleButton from "@/components/button/LoginWithGoogleButton";
import Link from "next/link";
import "./register.css";
import bgIcon from "../../../assets/images/auth/bg-circle.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  checkEmail,
  getAddressFromCoordinates,
  getCSRF,
  getLatLng,
  logIn,
  register,
} from "@/api";
import ToastNotification from "@/components/toast/ToastNotification";
import AddressInput from "@/components/input/AddressInput";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Import the eye icons
import { Errors, FormData } from "@/types";
import { useDispatch } from "react-redux";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseConfig";
import { setUser } from "@/redux/userSlice";
import { AiOutlineArrowLeft } from "react-icons/ai";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    address: "",
    latitude: "",
    longitude: "",
    avatar: "",
    role_id: 2, // Default is customer
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    keyword: "SUCCESS" | "ERROR" | "INFO" | "WARNING";
  }>({
    message: "",
    keyword: "INFO",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.name) newErrors.name = "Họ và tên không được để trống.";
    if (!formData.email) {
      newErrors.email = "Email không được để trống.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ.";
    }
    if (!formData.address) newErrors.address = "Địa chỉ không được để trống.";
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (formData.password_confirmation !== formData.password) {
      newErrors.password_confirmation = "Mật khẩu xác nhận không khớp.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (validate()) {
      setLoading(true);
      const location = await getLatLng(formData.address);
      if (location && location.lat && location.lng) {
        formData.latitude = location.lat;
        formData.longitude = location.lng;
        formData.avatar =
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQct7GVODYZLmiBWG1WRsQ9ekyJLTLT-o2CMQ&s";
        try {
          const response = await register(formData);
          console.log(response);
          // Check for response validity
          if (response) {
            setToast({ message: "Đăng ký thành công!", keyword: "SUCCESS" });
            setTimeout(() => {
              router.push("/login");
            }, 2000); // Delay before redirecting to login
          } else {
            setToast({
              message: "Đăng ký thất bại! Email đã tồn tại!",
              keyword: "ERROR",
            });
          }
        } catch (error: any) {
          console.error("Error:", error.response?.data || error.message);
          setToast({
            message: "Đăng ký thất bại. Vui lòng thử lại!",
            keyword: "ERROR",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setToast({
          message: "Địa chỉ không hợp lệ. Vui lòng kiểm tra lại.",
          keyword: "ERROR",
        });
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user?.email) {
        setErrorMessage("Email không tồn tại trong tài khoản Google.");
        return;
      }
      const generatedPassword = user.uid.slice(0, 10); // Lấy 10 ký tự đầu từ UID
      const checkResponse = await checkEmail(user.email);

      if (checkResponse) {
        const csrfToken = await getCSRF();
        const data = await logIn(user.email, generatedPassword, csrfToken);
        storeUserData(data);
      } else {
        const locationData = localStorage.getItem("user_location");
        const [latitude, longitude] = locationData
          ? JSON.parse(locationData)
          : [null, null];

        if (!latitude || !longitude) {
          setErrorMessage("Không thể lấy tọa độ vị trí.");
          return;
        }

        const address = await getAddressFromCoordinates(latitude, longitude);

        const formData: FormData = {
          name: user.displayName || "Người dùng Google",
          email: user.email,
          password: generatedPassword,
          password_confirmation: generatedPassword,
          address,
          latitude,
          longitude,
          avatar: user?.photoURL,
          role_id: 2,
        };

        const res = await register(formData);
        if (res?.data?.user) {
          const csrfToken = await getCSRF();
          const data = await logIn(user.email, generatedPassword, csrfToken);
          storeUserData(data);
        } else {
          setErrorMessage("Đăng ký thất bại, vui lòng thử lại.");
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi đăng nhập với Google:", error);
      setErrorMessage("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  };

  const storeUserData = (data: any) => {
    if (data) {
      const { access_token, refresh_token, user } = data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      dispatch(setUser(user));
      document.cookie = `authToken=${access_token}; path=/; secure`;
      router.push("/"); // Redirect to homepage
    } else {
      setErrorMessage("Dữ liệu không hợp lệ, vui lòng thử lại.");
    }
  };
  return (
    <motion.div
      className="flex flex-col md:flex-row w-full min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Section - Image */}
      <motion.div
        className="relative flex-1 left-box"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-opacity-40"></div>
        <div className="absolute top-1/3 left-10 text-white">
          <div className="bg-green-500 px-4 py-2 rounded-full text-sm font-semibold inline-block mb-4">
            Đảm bảo chất lượng
          </div>
          <h2 className="text-xl font-bold">
            Mang lại trải nghiệm tốt
            <br />
            khi mua sắm
          </h2>
        </div>
      </motion.div>
      <Link
        href="/"
        className="absolute z-50 top-3 right-[42%] flex items-center gap-1 text-gray-500  hover:text-primary  transition-all duration-300"
      >
        <AiOutlineArrowLeft className="text-lg" /> Về trang chủ
      </Link>
      <div className="flex items-center justify-center flex-1 bg-white">
        {/* Form Box */}
        <motion.div
          className="w-full max-w-md bg-white rounded-lg p-8 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 text-center">
            Eco<span className="text-primary-light">Save</span>
          </h1>
          <p className="text-center text-sm text-gray-500 mb-4">
            Bằng cách tiếp tục, bạn cho biết rằng bạn đã đọc và đồng ý với{" "}
            <Link href="/terms" className="text-primary">
              Điều khoản sử dụng
            </Link>
          </p>
          {/* Google Login Button */}
          <div className="mb-4">
            <LoginWithGoogleButton handleRegister={handleSignInWithGoogle} />
          </div>
          <p className="text-center text-sm text-gray-500 mb-4">
            Hoặc đăng ký với
          </p>
          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="name"
                placeholder="Họ và tên"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
              {errors.name && (
                <span className="text-red-500 text-xs">{errors.name}</span>
              )}
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Nhập email"
                value={formData.email}
                autoComplete="off"
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
              {errors.email && (
                <span className="text-red-500 text-xs">{errors.email}</span>
              )}
            </div>
            <div>
              <AddressInput setFormData={setFormData} />
              {errors.address && (
                <span className="text-red-500 text-xs">{errors.address}</span> // Hiển thị lỗi nếu có
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiEye className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {errors.password && (
                <span className="text-red-500 text-xs">{errors.password}</span>
              )}
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                placeholder="Xác nhận mật khẩu"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiEye className="w-5 h-5 text-gray-600" />
                )}
              </button>
              {errors.password_confirmation && (
                <span className="text-red-500 text-xs">
                  {errors.password_confirmation}
                </span>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>
          <div className="text-center text-sm text-gray-500 mt-4">
            Bạn đã có tài khoản?
            <Link href="/login" className="text-primary">
              Đăng nhập
            </Link>
          </div>
        </motion.div>
      </div>
      {/* Toast Notification */}
      {toast.message && (
        <ToastNotification message={toast.message} keyword={toast.keyword} />
      )}
    </motion.div>
  );
};
export default Register;
