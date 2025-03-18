import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Typography, Rating, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

// Định nghĩa kiểu dữ liệu cho lời chứng thực
interface LoiChungThuc {
  ten: string;
  danhGia: number;
  binhLuan: string;
}

// Dữ liệu mẫu về lời chứng thực
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

  // Xử lý điều hướng
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
    <Box className="py-12 bg-gray-50">
      {/* Phần tiêu đề */}
      <Box className="text-center mb-8">
        <Typography
          variant="h3"
          className="text-4xl font-bold text-gray-900"
          style={{ fontFamily: "inherit" }}
        >
          Khách Hàng Nói, chúng tôi Lắng Nghe
        </Typography>
        <Typography
          variant="body1"
          className="text-gray-600 mt-4 max-w-3xl mx-auto"
        >
          Khám phá những gì khách hàng trung thành của chúng tôi nói về trải nghiệm
          với chúng tôi. Tìm hiểu các lời chứng thực thể hiện sự hài lòng của họ và
          lý do tại sao chúng tôi là lựa chọn hàng đầu cho việc mua sắm tạp hóa tiện lợi.
        </Typography>
      </Box>

      {/* Phần trình chiếu */}
      <Box className="relative max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={chiSoHienTai}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Hiển thị 3 lời chứng thực cùng lúc */}
            {[0, 1, 2].map((doDoi) => {
              const chiSo = (chiSoHienTai + doDoi) % danhSachLoiChungThuc.length;
              const loiChungThuc = danhSachLoiChungThuc[chiSo];
              return (
                <Box
                  key={chiSo}
                  className="bg-white p-6 rounded-lg text-center"
                >
                  {/* Placeholder cho hình ảnh khách hàng */}
                  <Box className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
                  <Typography
                    variant="h6"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {loiChungThuc.ten}
                  </Typography>
                  <Rating
                    value={loiChungThuc.danhGia}
                    readOnly
                    className="my-2"
                  />
                  <Typography variant="body2" className="text-gray-600">
                    {loiChungThuc.binhLuan}
                  </Typography>
                </Box>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Mũi tên điều hướng */}
        <IconButton
          onClick={xuLyQuayLai}
          className="absolute left-0 top-1/2 transform -translate-y-1/2"
        >
          <ArrowBackIos />
        </IconButton>
        <IconButton
          onClick={xuLyTiepTheo}
          className="absolute right-0 top-1/2 transform -translate-y-1/2"
        >
          <ArrowForwardIos />
        </IconButton>

        {/* Chấm điều hướng */}
        <Box className="flex justify-center mt-6">
          {danhSachLoiChungThuc.map((_, chiSo) => (
            <Box
              key={chiSo}
              className={`w-3 h-3 mx-1 rounded-full ${
                chiSo === chiSoHienTai ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TestimonialSlider;