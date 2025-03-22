import Image from "next/image";
import { FaTwitter, FaLinkedin } from "react-icons/fa";
import founderGiaBao from "../../assets/images/users/bao.jpg";
import founderBichQuyen from "../../assets/images/users/quyen.jpg";
import founderThiHi from "../../assets/images/users/hi.jpg";
import founderThuyNgan from "../../assets/images/users/ngan.jpg";

const founders = [
  {
    id: 1,
    name: "Phạm Gia Bảo",
    role: "CTO, Tech Lead",
    description: "bao.pham@ecosave.com",
    image: founderGiaBao,
  },
  {
    id: 2,
    name: "Lê Thị Bích Quyên",
    role: "Director, Business Analyst",
    description: "quyen.le@ecosave.com",
    image: founderBichQuyen,
  },
  {
    id: 3,
    name: "Phạm Thị Hỉ",
    role: "Quality Assurance Manager",
    description: "hi.pham@ecosave.com",
    image: founderThiHi,
  },
  {
    id: 4,
    name: "Hồ Thị Ngân",
    role: "Solution Architect",
    description: "ngan.ho@ecosave.com",
    image: founderThuyNgan,
  },
];

const SocialIcons = () => (
  <div className="flex justify-center gap-3 mt-3">
    <a
      href="#"
      className="text-blue-500 hover:text-blue-600 transition duration-300"
    >
      <FaTwitter size={18} />
    </a>
    <a
      href="#"
      className="text-blue-800 hover:text-blue-900 transition duration-300"
    >
      <FaLinkedin size={18} />
    </a>
  </div>
);

export default function FoundersSection() {
  return (
    <section className="py-12 text-center">
      <h4 className="text-primary font-medium text-sm">Đại gia đình sáng lập</h4>
      <h2 className="text-xl md:text-3xl font-bold mt-2">
        Gặp gỡ các nhà sáng lập
      </h2>
      <p className="text-gray-600 mt-3 max-w-3xl mx-auto text-sm md:text-base">
        Chúng tôi là một đội ngũ nhiệt huyết và sáng tạo, luôn nỗ lực mang đến
        những giải pháp tối ưu và sáng tạo nhất để đóng góp có ích cho cộng đồng.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10 px-4">
        {founders.map(({ id, name, role, description, image }) => (
          <div
            data-aos="fade-up"
            key={id}
            className="bg-white p-4 md:p-6 rounded-xl border border-primary text-center transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto relative overflow-hidden rounded-full">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
                loading="lazy"
                sizes="96px"
                quality={75}
              />
            </div>
            <h3 className="text-base md:text-lg font-bold mt-3">{name}</h3>
            <p className="text-xs md:text-sm text-primary font-medium">{role}</p>
            <p className="text-gray-600 text-xs md:text-sm mt-2">{description}</p>
            <SocialIcons />
          </div>
        ))}
      </div>
    </section>
  );
}
