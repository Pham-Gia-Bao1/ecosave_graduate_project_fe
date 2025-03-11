import React, { memo } from "react";
import { CartSummaryProps } from "@/types";
import { formatMoney } from "@/utils";

export const CartSummary: React.FC<CartSummaryProps> = memo(({ total, savings, handlePayment }) => {
  return (
    <div className="p-6 bg-gray-50 border-l">
      <h3 className="text-lg font-semibold mb-4">Tổng quan</h3>
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Tổng tiền hàng:</span>
          <span> {formatMoney(total, "đ")}</span>
        </div>
        <div className="flex justify-between">
          <span>Bạn tiết kiệm được:</span>
          <span> {formatMoney(savings, "đ")}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>Thành tiền:</span>
          <span className="font-medium text-2xl text-red-500">{formatMoney(total, "đ")}</span>
        </div>
      </div>
      <div>
          <button
            onClick={handlePayment}
            disabled={total === 0}
            className={`w-full mx-auto py-2 px-4 rounded-md transition-colors
              ${total === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-teal-500 hover:bg-teal-600 text-white"}
            `}
          >
            Đặt hàng
          </button>
        </div>
    </div>
  );
});

CartSummary.displayName = "CartSummary";
