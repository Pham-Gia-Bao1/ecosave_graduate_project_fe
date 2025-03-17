"use client";
import React, { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import menuItemsData from "../../assets/json/menuItems.json";
import defaultAvatar from "../../assets/images/users/userAvata1.png";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";
import { Badge, Drawer } from "@mui/material";
import { Favorite, Notifications, ShoppingCart, Close } from "@mui/icons-material";
import { fetchUserInfo } from "@/api";
import { setUser } from "@/redux/userSlice";
import NotificationsComponent from "@/app/notification/Notifications";
import useNotifications from "@/hooks/useNotifications";
import useCart from "@/hooks/useCart";
import RemainderComponent from "@/components/remainder/RemainderComponent";
import { getCurrentDate } from "@/utils/helpers/getCurrentDate";
import { reset } from "@/redux/notificationSlice";
import Navbar from "./navbar/NavBar";
const Header: React.FC = () => {
  const isLogin = typeof window !== "undefined" && document.cookie.includes("access_token");
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.user);
  useNotifications();
  useCart();
  const notificationCount = useSelector(
    (state: RootState) => state.notifications.count
  );
  const currentDate = getCurrentDate();
  const [menuItems] = useState<{ [key: string]: string }>(
    menuItemsData.menuItems1
  );
  const totalItems = useSelector((state: RootState) => state.cart.totalItems);
  const [typeOfNotification, setTypeOfNotification] = useState<
    "new" | "reminder"
  >("new");
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const toggleNotification = () => {
    dispatch(reset());
    setIsNotificationOpen(!isNotificationOpen);
  };
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) {
        const token = localStorage.getItem("access_token");
        if (token) {
          try {
            const userInfo = await fetchUserInfo(token);
            console.log(userInfo);
            dispatch(setUser(userInfo));
          } catch (error) {
            console.error("Error fetching user info:", error);
          }
        }
      }
    };
    fetchUser();
  }, [dispatch, user]);
  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Sidebar Notification Drawer */}
      <Drawer anchor="right" open={isNotificationOpen} onClose={toggleNotification}>
        <div className="w-[300px] lg:w-[500px] min-h-full h-auto bg-white p-6">
          {/* Header */}
          <div className="bg-primary flex justify-between items-center p-4 rounded-t-lg sticky top-0 z-30">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Thông báo sản phẩm gần bạn
              </h2>
              <p className="text-gray-200">
                Bạn có {notificationCount} thông báo mới
              </p>
            </div>
            <button
              onClick={toggleNotification}
              className="text-white hover:text-gray-300"
            >
              <Close fontSize="large" />
            </button>
          </div>
          {/* Tabs */}
          <div className="w-full flex">
            <div
              onClick={() => setTypeOfNotification("new")}
              className={`w-1/2 py-2 text-center cursor-pointer transition-colors ${
                typeOfNotification === "new"
                  ? " text-black font-semibold border border-b-4 border-primary"
                  : "bg-white hover:bg-primary-light border text-gray-800"
              }`}
            >
              Sản phẩm mới
            </div>
            <div
              onClick={() => setTypeOfNotification("reminder")}
              className={`w-1/2 py-2 text-center cursor-pointer transition-colors ${
                typeOfNotification === "reminder"
                  ? " text-black font-semibold border border-b-4 border-primary"
                  : "bg-white hover:bg-primary-light border text-gray-800"
              }`}
            >
              Sản phẩm nhắc nhở
            </div>
          </div>
          {/* Nội dung */}
          {typeOfNotification === "new" && <NotificationsComponent />}
          {typeOfNotification === "reminder" && (
            <RemainderComponent currentDate={currentDate} user={user} />
          )}
        </div>
      </Drawer>
      {/* Top Header */}
      <div className="hidden lg:flex items-center justify-between bg-primary text-white px-6 text-xsm">
        <p>{user?.address ?? "99 Tô Hiến Thành - DN"}</p>
        <div className="flex items-center space-x-4">Tiếng Việt</div>
      </div>
      {/* Desktop Navbar */}
      <Navbar user={user} isLogin={isLogin} />
      {/* Mobile Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 shadow-md">
        {/* Menu Icon */}
        <FaBars
          className="text-gray-600 text-xl cursor-pointer"
          onClick={toggleSidebar}
        />
        <h1 className="text-2xl font-bold text-primary">
          Eco<span className="text-gray-800">Save</span>
        </h1>
        <div className="flex items-center space-x-4">
          <Link href="#" onClick={toggleNotification}>
            <Badge badgeContent={2} color="error">
              <Notifications className="text-gray-600 cursor-pointer hover:text-primary" />
            </Badge>
          </Link>
          <Link href="/favorites">
            <Favorite className="text-gray-600 cursor-pointer hover:text-primary" />
          </Link>
          <Link href="/cart">
            <Badge badgeContent={totalItems} color="error">
              <ShoppingCart className="text-gray-600 cursor-pointer hover:text-primary" />
            </Badge>
          </Link>
        </div>
      </div>
      {/* Sidebar */}
      <div
        className={`fixed inset-0 bg-opacity-50 z-40 transition-opacity ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>
      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <span className="text-lg font-bold text-primary-light">Menu</span>
          <button onClick={toggleSidebar}>
            <FaTimes className="text-2xl text-gray-600" />
          </button>
        </div>
        <nav className="flex flex-col space-y-4 p-4 text-gray-700">
          {Object.entries(menuItems).map(([key, label]) => (
            <Link key={key} href={`/${key.toLowerCase()}`}>
              <p className="hover:text-primary-light">{label}</p>
            </Link>
          ))}
          <Link href="/account">
            <div className="flex items-center space-x-2 cursor-pointer hover:text-primary-light transition-colors duration-300">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={user?.avatar || defaultAvatar} // Fallback to default if avatar is null
                  width={40} // Set the width to 40px
                  height={40} // Set the height to 40px
                  alt="avatar user"
                  className="object-cover" // Ensures the image covers the circle without distortion
                />
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-lg">
                  {user?.username || "Customer"} {/* Display the user's name */}
                </p>
              </div>
            </div>
          </Link>
        </nav>
      </aside>
    </header>
  );
};
export default Header;
