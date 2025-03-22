import { RootState } from "@/redux/store";
import React, { FormEvent, useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";

const CheckoutFormGetInfo: React.FC = () => {
  // Lấy dữ liệu user từ Redux, chỉ lấy trường cần thiết
  const user = useSelector((state: RootState) => state.user.user);

  // useMemo để tính toán dữ liệu mặc định cho form tránh re-render
  const defaultFormData = useMemo(() => ({
    name: user?.username || "Your name",
    phone: user?.phone_number || "00000000000",
  }), [user]);

  // State lưu thông tin người dùng
  const [formData, setFormData] = useState(defaultFormData);
  const [paymentMethod, setPaymentMethod] = useState<string>("VNpay");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Cập nhật formData khi user thay đổi
  useEffect(() => {
    setFormData(defaultFormData);
  }, [defaultFormData]);

  // Xử lý khi người dùng nhập liệu
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  // Xử lý khi thay đổi phương thức thanh toán
  const handlePaymentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
  }, []);

  // Xử lý submit form
  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Đã gửi thông tin:", formData);
    console.log("Phương thức thanh toán đã chọn:", paymentMethod);
    setIsEditing(false); // Chuyển sang chế độ xem sau khi lưu
  }, [formData, paymentMethod]);

  return (
    <div className="flex justify-center items-center w-full z-10">
      <form onSubmit={handleSubmit} className="w-full bg-white rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Thông Tin Đơn Hàng</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Tên
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Tên của bạn"
            required
            disabled={!isEditing}
          />
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
            Phương Thức Thanh Toán
          </label>
          <select
            name="paymentMethod"
            value={paymentMethod}
            onChange={handlePaymentChange}
            className="w-full px-3 py-2 border rounded-lg"
            disabled={!isEditing}
          >
            <option value="VNpay">VNpay</option>
          </select>
        </div>
      </form>
    </div>
  );
};

export default React.memo(CheckoutFormGetInfo);
