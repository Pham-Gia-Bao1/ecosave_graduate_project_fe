"use client";
import { useState, useRef, useEffect } from "react";
import {
  Badge,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
} from "@mui/material";
import {
  Favorite,
  Notifications,
  ShoppingCart,
  Close,
  ExitToApp as LogOut,
  AddShoppingCart,
  FavoriteBorder,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ClipboardList, Package, Heart, Delete } from "lucide-react";
import Link from "next/link";
import menuItemsData from "../../../assets/json/menuItems.json";
import { Product, UserProfile, WishList } from "@/types";
import Image from "next/image";
import defaultAvatar from "../../../assets/images/users/userAvata1.png";
import LOGO from "../../../assets/images/logo/LOGO.png";
import NotificationsComponent from "@/app/notification/Notifications";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import useNotifications from "@/hooks/useNotifications";
import useCart from "@/hooks/useCart";
import RemainderComponent from "@/components/remainder/RemainderComponent";
import { getCurrentDate } from "@/utils/helpers/getCurrentDate";
import { reset } from "@/redux/notificationSlice";
import api from "@/api";
import { AnimatePresence, motion } from "framer-motion";
import { useWishlist } from "@/hooks/useWishlist";
import { formatMoney } from "@/utils";
import ActiveMenu from "./ActiveMenu";

export interface NavbarProps {
  user: UserProfile | null;
  isLogin: boolean | null;
}

const Navbar: React.FC<NavbarProps> = ({ user, isLogin }) => {
  useNotifications();
  useCart();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const { handleRemove, handleAddToCart, handleAddAllToCart } = useWishlist();
  const dispatch = useDispatch();
  const router = useRouter();
  const notificationCount = useSelector(
    (state: RootState) => state.notifications.count
  );
  const currentDate = getCurrentDate();
  const [menuItems] = useState<{ [key: string]: string }>(
    menuItemsData.menuItems1
  );
  const [active, setActive] = useState<number>(0);
  const [menuIcons] = useState<{ [key: string]: string }>(
    menuItemsData.menuItems2
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] =
    useState<boolean>(false);
  const menuRefs = useRef<(HTMLLIElement | null)[]>([]);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const totalItems = useSelector((state: RootState) => state.cart.totalItems);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [typeOfNotification, setTypeOfNotification] = useState<
    "new" | "reminder"
  >("new");

  const handleAddToCartWithLoading = async (
    product: Product,
    wishlistId: number
  ) => {
    setLoadingItems((prev) => ({ ...prev, [wishlistId]: true }));
    try {
      await handleAddToCart(product);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoadingItems((prev) => ({ ...prev, [wishlistId]: false }));
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    dispatch(reset());
  };

  const slideInFromRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  const toggleWishlist = () => {
    setIsWishlistOpen(!isWishlistOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    await api.auth.logout(dispatch);
    setLogoutLoading(false);
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const icons: { [key: string]: JSX.Element } = {
    Notification: (
      <Badge
        badgeContent={notificationCount}
        color="error"
        onClick={toggleSidebar}
        className="cursor-pointer"
      >
        <Notifications />
      </Badge>
    ),
    Wishlist: (
      <div onClick={toggleWishlist} className="cursor-pointer">
        <Badge badgeContent={wishlist.length} color="error">
          <Favorite />
        </Badge>
      </div>
    ),
    Cart: (
      <Link href="/cart">
        <Badge badgeContent={totalItems} color="error">
          <ShoppingCart />
        </Badge>
      </Link>
    ),
  };

  return (
    <nav
      className={`hidden lg:flex items-center justify-between w-full px-6 py-2 shadow-md`}
    >
      <div className="flex items-center space-x-4 justify-normal">
        <h1 className="text-3xl font-bold text-primary">
          Eco<span className="text-gray-800">Save</span>
        </h1>
        <Image
          src={LOGO.src}
          alt="Logo"
          width={50}
          height={50}
          className="object-contain"
        />
      </div>
      <div className="flex-grow flex justify-center relative">
        <ActiveMenu menuItems={menuItems} />
      </div>
      <div className="flex items-center space-x-6">
        {isLogin &&
          Object.keys(menuIcons).map((key) => (
            <div
              key={key}
              className="text-gray-600 cursor-pointer hover:text-primary-light transition-colors duration-300 text-xl"
            >
              {icons[key]}
            </div>
          ))}
        {isLogin === null ? <></> : isLogin ? (
          <div className="relative" ref={profileDropdownRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer hover:text-primary-light transition-colors duration-300"
              onClick={toggleProfileDropdown}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={user?.avatar || defaultAvatar}
                  width={40}
                  height={40}
                  alt="avatar user"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Xin chào</p>
                <p className="text-gray-800 font-semibold text-lg">
                  {user?.username || "Guest"}
                </p>
              </div>
            </div>
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={user?.avatar || defaultAvatar}
                          width={48}
                          height={48}
                          alt="avatar user"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user?.username || "Guest"}
                        </p>
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <button className="text-sm text-blue-600 hover:underline">
                            Xem tất cả trang cá nhân
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/order-history"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <ClipboardList
                        className="text-gray-600"
                        fontSize="small"
                      />
                      <span className="text-gray-800">
                        Xem lịch sử đơn hàng
                      </span>
                    </Link>
                    <Link
                      href="/expiry-items-reminder"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <Package className="text-gray-600" fontSize="small" />
                      <span className="text-gray-800">
                        Quản lý kho sản phẩm nhắc nhở
                      </span>
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <Heart className="text-gray-600" fontSize="small" />
                        <span className="text-gray-800">
                          Xem các sản phẩm yêu thích
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left border-t border-gray-100"
                    >
                      <LogOut className="text-gray-600" fontSize="small" />
                      <span className="text-gray-800">Đăng xuất</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex space-x-4">
            <Link href="/login">
              <button className="bg-orange-500 text-white px-4 py-2 rounded transition-colors duration-300 hover:bg-orange-600">
                Đăng nhập
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-primary text-white px-4 py-2 rounded transition-colors duration-300 hover:bg-primary-dark">
                Đăng ký
              </button>
            </Link>
          </div>
        )}
      </div>
      <Drawer anchor="right" open={isSidebarOpen} onClose={toggleSidebar}>
        <div className="w-[300px] lg:w-[500px] min-h-full h-auto bg-white p-6">
          <div className="bg-primary flex justify-between items-center p-4 rounded-t-lg sticky top-0 z-30">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Thông báo sản phẩm gần bạn và nhắc nhở
              </h2>

            </div>
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-gray-300"
            >
              <Close fontSize="large" />
            </button>
          </div>
          <div className="w-full flex sticky top-14 z-50">
            <div
              onClick={() => setTypeOfNotification("new")}
              className={`w-1/2 py-2 bg-white text-center cursor-pointer transition-colors ${
                typeOfNotification === "new"
                  ? "text-black font-semibold border border-b-4 border-primary"
                  : "bg-white hover:bg-primary-light border text-gray-800"
              }`}
            >
              Sản phẩm mới
            </div>
            <div
              onClick={() => setTypeOfNotification("reminder")}
              className={`w-1/2 py-2 text-center cursor-pointer bg-white transition-colors ${
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
      <Drawer anchor="right" open={isWishlistOpen} onClose={toggleWishlist}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideInFromRight}
          className="w-[300px] md:w-[400px] min-h-full h-auto bg-white p-6"
        >
          <motion.div
            variants={slideInFromRight}
            className="flex justify-between items-center mb-6"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Danh sách yêu thích
              </h2>
              <p className="text-gray-600">{wishlist.length} sản phẩm</p>
            </div>
            <IconButton onClick={toggleWishlist}>
              <Close />
            </IconButton>
          </motion.div>
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto overflow-x-hidden">
            {wishlist.length > 0 ? (
              wishlist.map((item: WishList, index) => (
                <motion.div
                  key={item.id}
                  variants={slideInFromRight}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={
                        item.product.images[0]?.image_url ||
                        "/placeholder-image.jpg"
                      }
                      alt={item.product.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 truncate-description-2-line">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatMoney(
                        Number.parseInt(
                          item.product.discounted_price.toLocaleString()
                        ),
                        "VND"
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconButton
                      onClick={() =>
                        handleAddToCartWithLoading(item.product, item.id)
                      }
                      size="small"
                      title="Thêm vào giỏ hàng"
                      disabled={loadingItems[item.id]}
                    >
                      {loadingItems[item.id] ? (
                        <CircularProgress size={20} className="text-primary" />
                      ) : (
                        <AddShoppingCart className="text-primary" />
                      )}
                    </IconButton>
                    <IconButton
                      onClick={() => handleRemove(item.id)}
                      size="small"
                      title="Xóa khỏi wishlist"
                    >
                      <Delete className="text-gray-200 hover:text-red-500" />
                    </IconButton>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.p
                variants={slideInFromRight}
                className="text-center text-gray-500 py-8"
              >
                Danh sách yêu thích đang trống
              </motion.p>
            )}
          </div>
          {wishlist.length > 0 && (
            <motion.div
              variants={slideInFromRight}
              className="mt-6 pt-4 border-t flex flex-col gap-2"
            >
              <Link href="/wishlist">
                <button
                  onClick={toggleWishlist}
                  className="w-full border border-primary text-primary hover:bg-primary-light/20 p-4 flex items-center justify-center gap-2 rounded-md"
                >
                  <FavoriteBorder />
                  Xem trang danh sách yêu thích
                </button>
              </Link>
              <button
                onClick={handleAddAllToCart}
                className="w-full bg-primary hover:bg-primary-light p-4 text-white font-semibold flex items-center justify-center gap-2 rounded-md"
              >
                <AddShoppingCart />
                Thêm tất cả vào giỏ hàng
              </button>
            </motion.div>
          )}
        </motion.div>
      </Drawer>
    </nav>
  );
};

export default Navbar;