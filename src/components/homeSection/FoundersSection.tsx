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
    description:
      "bao.pham@ecosave.com",
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
  <div className="flex justify-center gap-4 mt-4">
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
    <section className="py-16 text-center">
      <h4 className="text-primary font-medium text-sm">Đại gia đình sáng lập</h4>
      <h2 className="text-3xl font-bold mt-2">Gặp gỡ các nhà sáng lập</h2>
      <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
        Chúng tôi là một đội ngũ nhiệt huyết và sáng tạo, luôn luôn nỗ lực để mang đến những
        giải pháp tối ưu và sáng tạo nhất để mang đến những giải pháp và đóng góp có ích cho cộng đồng.
      </p>

      <div className="grid md:grid-cols-4 gap-6 mt-10 px-4">
        {founders.map(({ id, name, role, description, image }) => (
          <div
            data-aos="fade-up"
            key={id}
            className="bg-white p-6 rounded-xl border border-primary text-center transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <div className="w-32 h-32 mx-auto relative overflow-hidden rounded-full">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
                loading="lazy"
                sizes="128px"
                quality={75}
              />
            </div>
            <h3 className="text-lg font-bold mt-4">{name}</h3>
            <p className="text-sm text-primary font-medium">{role}</p>
            <p className="text-gray-600 text-sm mt-2">{description}</p>
            <SocialIcons />
          </div>
        ))}
      </div>
    </section>
  );
}
