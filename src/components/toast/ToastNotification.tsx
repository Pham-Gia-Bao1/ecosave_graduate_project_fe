import { useState, useEffect } from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

interface ToastNotificationProps {
  message: string;
  keyword: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  onClose?: () => void; // Thêm prop onClose để xử lý từ bên ngoài
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, keyword, onClose }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true); // Reset trạng thái mở khi nhận props mới
  }, [message, keyword]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose(); // Gọi callback nếu có
  };

  const alertSeverity: Record<ToastNotificationProps["keyword"], AlertColor> = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={alertSeverity[keyword] || "info"} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastNotification;
