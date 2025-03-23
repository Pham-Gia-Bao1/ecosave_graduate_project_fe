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
import api  from "@/api";
import { setUser } from "@/redux/userSlice";
import NotificationsComponent from "@/app/notification/Notifications";
import useNotifications from "@/hooks/useNotifications";
import useCart from "@/hooks/useCart";
import RemainderComponent from "@/components/remainder/RemainderComponent";
import { getCurrentDate } from "@/utils/helpers/getCurrentDate";
import { reset } from "@/redux/notificationSlice";
import Navbar from "./navbar/NavBar";

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLogin, setIsLogin] = useState<boolean | null>(null); // null initially

  const { user } = useSelector((state: RootState) => state.user);
  const notificationCount = useSelector((state: RootState) => state.notifications.count);
  const totalItems = useSelector((state: RootState) => state.cart.totalItems);

  const currentDate = getCurrentDate();
  const [menuItems] = useState<{ [key: string]: string }>(menuItemsData.menuItems1);
  const [typeOfNotification, setTypeOfNotification] = useState<"new" | "reminder">("new");

  useNotifications();
  useCart();


  useEffect(() => {
    setIsLogin(document.cookie.includes("authToken"));
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleNotification = () => {
    dispatch(reset());
    setIsNotificationOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!user && isLogin) {
        const token = localStorage.getItem("access_token");
        if (token) {
          try {
            const userInfo = await api.auth.fetchUser();
            if (userInfo) {
              dispatch(setUser(userInfo));
            }
          } catch (error) {
            console.error("Error fetching user info:", error);
          }
        }
      }
    };
    fetchUser();
  }, [dispatch, user, isLogin]);

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={isNotificationOpen}
        onClose={toggleNotification}
      >
        <div className="w-[300px] lg:w-[500px] min-h-full h-auto bg-white p-6">
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

          <div className="w-full flex">
            <div
              onClick={() => setTypeOfNotification("new")}
              className={`w-1/2 py-2 text-center cursor-pointer transition-colors ${
                typeOfNotification === "new"
                  ? "text-black font-semibold border border-b-4 border-primary"
                  : "bg-white hover:bg-primary-light border text-gray-800"
              }`}
            >
              Sản phẩm mới
            </div>
            <div
              onClick={() => setTypeOfNotification("reminder")}
              className={`w-1/2 py-2 text-center cursor-pointer transition-colors ${
                typeOfNotification === "reminder"
                  ? "text-black font-semibold border border-b-4 border-primary"
                  : "bg-white hover:bg-primary-light border text-gray-800"
              }`}
            >
              Sản phẩm nhắc nhở
            </div>
          </div>

          {typeOfNotification === "new" && <NotificationsComponent />}
          {typeOfNotification === "reminder" && (
            <RemainderComponent currentDate={currentDate} user={user} />
          )}
        </div>
      </Drawer>

      <div className="hidden lg:flex items-center justify-between bg-primary text-white px-6 text-xsm">
        <p>{user?.address ?? "99 Tô Hiến Thành - DN"}</p>
        <div className="flex items-center space-x-4">Tiếng Việt</div>
      </div>

      <Navbar user={user} isLogin={isLogin} />

      <div className="lg:hidden flex items-center justify-between p-4 shadow-md">
        <FaBars
          className="text-gray-600 text-xl cursor-pointer"
          onClick={toggleSidebar}
        />
        <h1 className="text-2xl font-bold text-primary">
          Eco<span className="text-gray-800">Save</span>
        </h1>
        <div className="flex items-center space-x-4">
          <Link href="#" onClick={toggleNotification}>
            <Badge badgeContent={notificationCount} color="error">
              <Notifications className="text-gray-600 cursor-pointer hover:text-primary" />
            </Badge>
          </Link>
          <Link href="/wishlist">
            <Favorite className="text-gray-600 cursor-pointer hover:text-primary" />
          </Link>
          <Link href="/cart">
            <Badge badgeContent={totalItems} color="error">
              <ShoppingCart className="text-gray-600 cursor-pointer hover:text-primary" />
            </Badge>
          </Link>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <span className="text-lg font-bold text-primary-light">Menu</span>
          <button onClick={toggleSidebar}>
            <FaTimes className="text-2xl text-gray-600" />
          </button>
        </div>
        <nav className="flex flex-col space-y-4 p-4 text-gray-700">
          {Object.entries(menuItems).map(([key, label]) => (
            <Link
              key={key}
              href={`/${key.toLowerCase()}`}
              onClick={toggleSidebar}
            >
              <p className="hover:text-primary-light">{label}</p>
            </Link>
          ))}
          <Link href="/profile" onClick={toggleSidebar}>
            <div className="flex items-center space-x-2 cursor-pointer hover:text-primary-light transition-colors duration-300">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={user?.avatar || defaultAvatar}
                  width={40}
                  height={40}
                  alt="User avatar"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-lg">
                  {user?.username || "Customer"}
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