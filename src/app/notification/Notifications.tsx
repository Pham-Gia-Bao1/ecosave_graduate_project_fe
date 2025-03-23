"use client";
import { useEffect, useState, useRef } from "react";
import useSocket from "@/hooks/useSocket";
import Image from "next/image";
import { useUserLocation } from "@/hooks/useUserLocation";
import calculateDistance from "@/utils/calculateDistance";
import { Notification, Product, Store } from "@/types";
import { useDispatch } from "react-redux";
import { increment, setCount } from "@/redux/notificationSlice";
import Link from "next/link";
import { formatCurrency } from "@/utils";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { motion } from "framer-motion";
import notificationSound from '../../assets/audio/notification.mp3';
const realTimeServerURL = "https://ecosave-realtime.zeabur.app/";

export default function NotificationsComponent() {
  const dispatch = useDispatch();
  const { notifications: newNotifications } = useSocket(realTimeServerURL) as {
    notifications: Notification[];
  };
  const [deletedProducts, setDeletedProducts] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const hasFetched = useRef(false);
  const [expandedStores, setExpandedStores] = useState<Record<number, boolean>>({});
  const userLocation = useUserLocation();
  const [visibleCount, setVisibleCount] = useState(20);
  const ITEMS_PER_PAGE = 20;

  // Thêm tham chiếu đến audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Khởi tạo audio khi component mount
  useEffect(() => {
    audioRef.current = new Audio(notificationSound); // Đường dẫn tới file âm thanh
    audioRef.current.preload = 'auto';
  }, []);

  // Phát âm thanh
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset về đầu
      audioRef.current.play().catch(error => {
        console.log("Error playing sound:", error);
      });
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      const storedNotifications = localStorage.getItem("notifications");
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
        dispatch(setCount(parsedNotifications.length));
      }
      hasFetched.current = true;
    }
  }, []);

  useEffect(() => {
    newNotifications.forEach((notification) => {
      switch (notification.event) {
        case "product.created":
          handleProductCreated(notification);
          break;
        case "product.updated":
          handleProductUpdated(notification);
          break;
        default:
          break;
      }
    });
  }, [newNotifications]);

  const handleProductCreated = (notification: Notification) => {
    setNotifications((prev) => {
      if (deletedProducts.includes(notification.data.product.id)) {
        return prev;
      }

      const exists = prev.some(
        (n) => n.data.product.id === notification.data.product.id
      );
      if (!exists) {
        const updatedNotifications = [notification, ...prev];
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        dispatch(increment());
        playNotificationSound(); // Phát âm thanh khi có thông báo mới
        return updatedNotifications;
      }
      return prev;
    });
  };

  const handleProductUpdated = (notification: Notification) => {
    setNotifications((prev) => {
      const updatedNotifications = prev.map((n) =>
        n.data.product.id === notification.data.product.id
          ? {
              ...notification,
              data: {
                ...notification.data,
                product: {
                  ...n.data.product,
                  ...notification.data.product,
                },
              },
            }
          : n
      );
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );
      playNotificationSound(); // Phát âm thanh khi có cập nhật
      return updatedNotifications;
    });
  };

  const removeNotification = (productId: number) => {
    setDeletedProducts((prev) => [...prev, productId]);
    setNotifications((prev) => {
      const updatedNotifications = prev.filter(
        (n) => n.data.product.id !== productId
      );
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );
      dispatch(setCount(updatedNotifications.length));
      return updatedNotifications;
    });
  };

  const groupedByStore = notifications.reduce((acc, notification) => {
    const storeId = notification.data.product.store?.id;
    if (!storeId) return acc;

    if (!acc[storeId]) {
      acc[storeId] = { store: notification.data.product.store, products: [] };
    }
    acc[storeId].products.push(notification.data.product);
    return acc;
  }, {} as Record<number, { store: Store; products: Product[] }>);

  const storeNotifications = Object.values(groupedByStore);

  const toggleStore = (storeId: number) => {
    setExpandedStores((prev) => ({
      ...prev,
      [storeId]: !prev[storeId],
    }));
  };

  const removeStoreNotifications = (storeId: number) => {
    const updatedNotifications = notifications.filter(
      (n) => n.data.product.store.id !== storeId
    );
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    dispatch(setCount(updatedNotifications.length));
  };

  const getTimeAgo = (timestamp: string) => {
    const notificationDate = new Date(timestamp);
    const currentDate = new Date();
    const differenceInTime = currentDate.getTime() - notificationDate.getTime();

    const differenceInMinutes = Math.floor(differenceInTime / (1000 * 60));
    const differenceInHours = Math.floor(differenceInTime / (1000 * 60 * 60));
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

    if (differenceInMinutes < 1) {
      return "Vừa xong";
    } else if (differenceInMinutes < 60) {
      return `${differenceInMinutes} phút trước`;
    } else if (differenceInHours < 24) {
      return `${differenceInHours} giờ trước`;
    } else if (differenceInDays === 1) {
      return "Hôm qua";
    } else {
      return `${differenceInDays} ngày trước`;
    }
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-lg">
      {storeNotifications.length === 0 ? (
        <p className="text-center text-gray-500">Không có thông báo mới.</p>
      ) : (
        <ul>
          {storeNotifications
            .slice(0, visibleCount)
            .map(({ store, products }) => (
              <motion.li
                key={store.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "spring", stiffness: 80, damping: 14 }}
                className="border-b py-4 last:border-b-0"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleStore(store.id)}
                >
                  <div className="flex justify-start overflow-hidden items-center gap-3 relative p-4">
                    <Link
                      href={`/stores/${store.id}`}
                      className="relative block w-[50px] h-[50px] flex-shrink-0"
                    >
                      <Image
                        src={store.avatar}
                        alt={store.store_name}
                        width={50}
                        height={50}
                        className="rounded object-cover w-[50px] h-[50px] hover:scale-105 border"
                      />
                      {products.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {products.length}
                        </span>
                      )}
                    </Link>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 truncate-description-1-line">
                        {store.store_name}
                      </h3>
                      <span>
                        {userLocation
                          ? (() => {
                              const distance = calculateDistance(
                                [store.latitude, store.longitude],
                                userLocation
                              );
                              return distance < 1
                                ? `${(distance * 1000).toFixed(0)}m`
                                : `${distance.toFixed(2)} km`;
                            })()
                          : "Đang xác định khoảng cách"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {expandedStores[store.id] ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStoreNotifications(store.id);
                      }}
                      className="text-gray-300 hover:text-red-700"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>
                {expandedStores[store.id] && (
                  <ul className="mt-3 space-y-2">
                    {products.map((product) => (
                      <motion.li
                        key={product.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{
                          type: "spring",
                          stiffness: 80,
                          damping: 14,
                        }}
                        className="flex items-center gap-3 border-l-2 pl-4 hover:bg-gray-100 p-2 rounded-lg"
                      >
                        <Link
                          href={`/products/${product.id}`}
                          className="flex gap-3 items-center w-full"
                        >
                          {product.images.length > 0 && (
                            <Image
                              src={product.images[0].image_url}
                              alt={product.name}
                              width={50}
                              height={50}
                              className="rounded object-cover w-[50px] h-[50px] hover:scale-105"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold hover:text-primary truncate-description-1-line">
                              {product.name}
                            </h4>
                            <div className="flex gap-2 items-center text-sm">
                              Từ
                              <span>
                                {formatCurrency(product.original_price)}
                              </span>
                              giảm còn
                              <span className="font-semibold text-red-500">
                                {formatCurrency(product.discounted_price)}
                              </span>
                            </div>
                          </div>
                        </Link>
                        <div className="text-xs text-gray-500 w-[100px]">
                          {getTimeAgo(product.created_at)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(product.id);
                          }}
                          className="text-gray-300 hover:text-red-700"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.li>
            ))}
        </ul>
      )}
      {visibleCount < storeNotifications.length && (
        <button
          onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
          className="w-full text-center text-blue-500 py-2 hover:underline"
        >
          Tải thêm
        </button>
      )}
    </div>
  );
}