import { useState } from "react";
import { FaShieldAlt, FaPiggyBank, FaChartLine } from "react-icons/fa";
import bgIcon from "../../assets/images/auth/bg-circle.png";
import Image from "next/image";

const values = [
  {
    id: 1,
    title: "An toàn",
    description: "Đảm bảo khách hàng mua đúng sản phẩm",
    icon: <FaShieldAlt className="text-2xl text-orange-500" />,
    color: "bg-green-400",
  },
  {
    id: 2,
    title: "Tiết kiệm",
    description: "Giảm chi phí khi mua sắm các loại hàng hóa",
    icon: <FaPiggyBank className="text-2xl text-blue-500" />,
    color: "bg-white",
  },
  {
    id: 3,
    title: "Ý nghĩa",
    description: "Tránh lãng phí thực phẩm ra môi trường",
    icon: <FaChartLine className="text-2xl text-pink-500" />,
    color: "bg-white",
  },
];
export default function ValuesSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="py-6 w-full text-center relative">
      {/* Ẩn ảnh nền trên mobile */}
      <Image
        src={bgIcon.src}
        width={100}
        height={100}
        alt="background login image"
        className="bg-image hidden sm:block lg:block absolute"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={50}
      />
      <Image
        src={bgIcon.src}
        width={300}
        height={300}
        alt="background login image"
        className="bg-image right-1 bottom-0 hidden sm:block lg:block absolute"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={50}
      />

      <h2 className="text-primary text-lg md:text-xl">Giá trị của chúng tôi</h2>
      <h2 className="text-2xl md:text-3xl font-bold mt-2">
        Mua sắm tiện lợi, tiêu dùng bền vững
      </h2>

      <div className="flex justify-center gap-4 mt-6 flex-wrap md:flex-nowrap">
        {values.map((value, index) => (
          <div
            data-aos="fade-up"
            key={value.id}
            className={`p-4 md:p-6 z-20 rounded-xl border cursor-pointer w-11/12 md:w-80 lg:w-96 transition-all duration-300 ${
              index === activeIndex ? "bg-primary text-white" : "bg-white"
            }`}
            onClick={() => setActiveIndex(index)}
          >
            <div
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-md ${
                index === activeIndex ? "bg-white" : "bg-gray-100"
              }`}
            >
              {value.icon}
            </div>
            <h3 className="text-base md:text-lg font-bold mt-3">{value.title}</h3>
            <p className="text-sm mt-2">{value.description}</p>
            <a
              href="#"
              className={`inline-block mt-4 font-medium text-sm ${
                index === activeIndex ? "text-white" : "text-primary-light"
              }`}
            >
              Xem thêm →
            </a>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-4 gap-2">
        {values.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full cursor-pointer ${
              index === activeIndex ? "bg-primary w-4 md:w-6 transition-all" : "bg-gray-300"
            }`}
            onClick={() => setActiveIndex(index)}
          ></div>
        ))}
      </div>
    </div>
  );
}
