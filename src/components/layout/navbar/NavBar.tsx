"use client";
import { useState, useRef, useEffect } from "react";
import { Badge, Drawer } from "@mui/material";
import {
  Favorite,
  Notifications,
  ShoppingCart,
  Close,
  ExitToApp as LogOut
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ClipboardList, Package, Heart} from "lucide-react";
import Link from "next/link";
import menuItemsData from "../../../assets/json/menuItems.json";
import { UserProfile } from "@/types";
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
import { logout } from "@/api";
export interface NavbarProps {
  user: UserProfile | null;
  isLogin: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, isLogin }) => {
  useNotifications(); // Kích hoạt lấy thông báo ngay khi Navbar render
  useCart();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);

  const dispatch = useDispatch();
  const router = useRouter();
  const notificationCount = useSelector(
    (state: RootState) => state.notifications.count
  );
  const currentDate = getCurrentDate();
  const [menuItems] = useState<{ [key: string]: string }>(
    menuItemsData.menuItems1
  );
  const [menuIcons] = useState<{ [key: string]: string }>(
    menuItemsData.menuItems2
  );
  const [active, setActive] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const menuRefs = useRef<(HTMLLIElement | null)[]>([]);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const totalItems = useSelector((state: RootState) => state.cart.totalItems);
  const [logoutLoading, setLogoutLoading] = useState(false); // 🆕 State để xử lý loading khi logout

  const [typeOfNotification, setTypeOfNotification] = useState<
    "new" | "reminder"
  >("new");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    dispatch(reset());
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside
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
      await logout(dispatch);
      setLogoutLoading(false);
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
      <Link href="/wishlist">
        <Badge badgeContent={wishlist.length} color="error">
          <Favorite />
        </Badge>
      </Link>
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
        <ul className="flex space-x-8 text-gray-600 relative">
          {Object.entries(menuItems).map(([key, label], index) => (
            <li
              key={key}
              ref={(el) => {
                menuRefs.current[index] = el;
              }}
              onClick={() => setActive(index)}
              className={`cursor-pointer transition-colors duration-300 text-lg ${
                active === index ? "text-primary" : "hover:text-primary-light"
              }`}
            >
              <Link href={`/${key.toLowerCase()}`} passHref>
                <p>{label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center space-x-6">
        {user &&
          Object.keys(menuIcons).map((key) => (
            <div
              key={key}
              className="text-gray-600 cursor-pointer hover:text-primary-light transition-colors duration-300 text-xl"
            >
              {icons[key]}
            </div>
          ))}
        {user ? (
          <div
            className="relative"
            ref={profileDropdownRef}
          >
            <div
              className="flex items-center space-x-2 cursor-pointer hover:text-primary-light transition-colors duration-300"
              onClick={toggleProfileDropdown}
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
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
                <p className="text-gray-600 text-sm">Hello</p>
                <p className="text-gray-800 font-semibold text-lg">
                  {user?.username || "Guest"}
                </p>
              </div>
            </div>

            {/* Profile Dropdown Modal */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                {/* Profile Header */}
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
                      <p className="font-semibold text-gray-900">{user?.username || "Guest"}</p>
                      <Link href="/profile" onClick={() => setIsProfileDropdownOpen(false)}>
                        <button className="text-sm text-blue-600 hover:underline">
                          Xem tất cả trang cá nhân
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="py-2">
                  <Link href="/order-history" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <ClipboardList className="text-gray-600" fontSize="small" />
                    <span className="text-gray-800">Xem lịch sử đơn hàng</span>
                  </Link>

                  <Link href="/expiry-items-reminder" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <Package className="text-gray-600" fontSize="small" />
                    <span className="text-gray-800">Quản lý kho sản phẩm nhắc nhở</span>
                  </Link>

                  <Link href="/favorite-products" onClick={() => setIsProfileDropdownOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <Heart className="text-gray-600" fontSize="small" />
                      <span className="text-gray-800">Xem các sản phẩm yêu thích</span>
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
              </div>
            )}
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
      {/* Sidebar Notification Drawer */}
      <Drawer anchor="right" open={isSidebarOpen} onClose={toggleSidebar}>
        <div className="w-[300px] lg:w-[500px] min-h-full h-auto bg-white p-6">
          {/* Header */}
          <div className="bg-primary flex justify-between items-center p-4 rounded-t-lg sticky top-0 z-30">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Thông báo sản phẩm gần bạn và nhắc nhở
              </h2>
              <p className="text-gray-200">
                Bạn có {notificationCount} thông báo mới
              </p>
            </div>
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-gray-300"
            >
              <Close fontSize="large" />
            </button>
          </div>
          {/* Tabs */}
          <div className="w-full flex sticky top-20 z-50">
            <div
              onClick={() => setTypeOfNotification("new")}
              className={`w-1/2 py-2  bg-white text-center cursor-pointer transition-colors ${
                typeOfNotification === "new"
                  ? " text-black font-semibold border border-b-4 border-primary"
                  : "bg-white hover:bg-primary-light border text-gray-800"
              }`}
            >
              Sản phẩm mới
            </div>
            <div
              onClick={() => setTypeOfNotification("reminder")}
              className={`w-1/2 py-2 text-center cursor-pointer bg-white transition-colors ${
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
    </nav>
  );
};

export default Navbar;