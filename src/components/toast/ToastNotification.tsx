import { useState } from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";
interface ToastNotificationProps {
  message: string;
  keyword: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
}
const ToastNotification: React.FC<ToastNotificationProps> = ({ message, keyword }) => {
  const [open, setOpen] = useState(true);
  const handleClose = () => setOpen(false);
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
      <Alert onClose={handleClose} severity={alertSeverity[keyword]} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
export default ToastNotification;
