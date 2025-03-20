import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { increment, setCount } from "@/redux/notificationSlice";
import useSocket from "@/hooks/useSocket";
const realTimeServerURL = "https://ecosave-realtime.zeabur.app";
interface Notification {
  data: {
    product: {
      id: number;
      name: string;
    };
  };
}

export default function useNotifications() {
  const dispatch = useDispatch();
  const { notifications: newNotifications } = useSocket(realTimeServerURL) as { notifications: Notification[] };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      const parsedNotifications = JSON.parse(storedNotifications);
      setNotifications(parsedNotifications);
      dispatch(setCount(parsedNotifications.length));
    }
  }, [dispatch]);
  useEffect(() => {
    if (newNotifications.length) {
      setNotifications((prev) => {
        const uniqueNotifications = newNotifications.filter(
          (n) =>
            n?.data?.product?.id !== undefined &&
            !prev.some((p) => p?.data?.product?.id === n?.data?.product?.id)
        );

        if (uniqueNotifications.length) {
          const updated = [...uniqueNotifications, ...prev];
          localStorage.setItem("notifications", JSON.stringify(updated));
          dispatch(increment());
          return updated;
        }

        return prev;
      });
    }
  }, [newNotifications, dispatch]);

  return notifications;
}
