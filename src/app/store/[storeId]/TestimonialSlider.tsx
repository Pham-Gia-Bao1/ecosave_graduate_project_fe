import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface LoiChungThuc {
  ten: string;
  danhGia: number;
  binhLuan: string;
}

const danhSachLoiChungThuc: LoiChungThuc[] = [
  {
    ten: "Phạm Hoàng Anh",
    danhGia: 5,
    binhLuan:
      '"EcoSave đã đơn giản hóa việc mua sắm hàng tuần của tôi. Giỏ hàng ảo thân thiện và quy trình thanh toán giúp tôi tiết kiệm rất nhiều thời gian. Một ứng dụng không thể thiếu cho những người mua sắm bận rộn!"',
  },
  {
    ten: "Lê Gia Kiệt",
    danhGia: 5,
    binhLuan:
      '"Tính năng kiểm tra sản phẩm theo thời gian thực thật sự thay đổi cuộc chơi! Tôi luôn biết sản phẩm nào còn hàng, giúp chuyến mua sắm tạp hóa của tôi trở nên dễ dàng và không phiền hà. chúng tôi không bao giờ làm tôi thất vọng."',
  },
  {
    ten: "Hoàng Thị Mỹ Vân",
    danhGia: 5,
    binhLuan:
      '"Tôi yêu thích các gợi ý cá nhân hóa! EcoSave hiểu sở thích của tôi và luôn cập nhật cho tôi những ưu đãi tuyệt vời. Giống như có một trợ lý mua sắm riêng—dịch vụ tuyệt vời!"',
  },
];

const TestimonialSlider: React.FC = () => {
  const [chiSoHienTai, setChiSoHienTai] = useState(0);

  const xuLyTiepTheo = () => {
    setChiSoHienTai((chiSoTruoc) =>
      chiSoTruoc === danhSachLoiChungThuc.length - 1 ? 0 : chiSoTruoc + 1
    );
  };

  const xuLyQuayLai = () => {
    setChiSoHienTai((chiSoTruoc) =>
      chiSoTruoc === 0 ? danhSachLoiChungThuc.length - 1 : chiSoTruoc - 1
    );
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-gray-900">Khách Hàng Nói, chúng tôi Lắng Nghe</h3>
        <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
          Khám phá những gì khách hàng trung thành của chúng tôi nói về trải nghiệm với chúng tôi.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={chiSoHienTai}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[0, 1, 2].map((doDoi) => {
              const chiSo = (chiSoHienTai + doDoi) % danhSachLoiChungThuc.length;
              const loiChungThuc = danhSachLoiChungThuc[chiSo];
              return (
                <div key={chiSo} className="bg-white p-6 rounded-lg text-center">
                  <h6 className="text-lg font-semibold text-gray-900">{loiChungThuc.ten}</h6>
                  <p className="text-gray-600">{loiChungThuc.binhLuan}</p>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Mũi tên điều hướng */}
        <button
          onClick={xuLyQuayLai}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-700 p-2 bg-white rounded-full shadow-md"
        >
          <FaArrowLeft />
        </button>
        <button
          onClick={xuLyTiepTheo}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-700 p-2 bg-white rounded-full shadow-md"
        >
          <FaArrowRight />
        </button>

        {/* Chấm điều hướng */}
        <div className="flex justify-center mt-6">
          {danhSachLoiChungThuc.map((_, chiSo) => (
            <div
              key={chiSo}
              className={`w-3 h-3 mx-1 rounded-full ${chiSo === chiSoHienTai ? "bg-primary" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;