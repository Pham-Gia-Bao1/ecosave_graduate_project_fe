"use client";

import { StaticImageData } from "next/image";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useAnimation } from "framer-motion";
import founderGiaBao from "../../assets/images/users/bao.jpg";
import founderBichQuyen from "../../assets/images/users/quyen.jpg";
import founderThiHi from "../../assets/images/products/product3.png";
import founderThuyNgan from "../../assets/images/products/product4.png";
interface FounderProps {
  name: string;
  role: string;
  bio: string;
  image: string | StaticImageData;
}

const founders: FounderProps[] = [
  {
    name: "Lê Thị Bích Quyên",
    role: "CEO & Co-Founder",
    bio: "Với hơn 10 năm kinh nghiệm trong lĩnh vực thương mại điện tử và công nghệ, Lê Thị Bích Quyên đã xây dựng tầm nhìn của EcoSave để giúp người tiêu dùng tiết kiệm và giảm lãng phí thực phẩm.",
    image: founderBichQuyen,
  },
  {
    name: "Phạm Gia Bảo",
    role: "CTO & Co-Founder",
    bio: "Chuyên gia công nghệ với bề dày kinh nghiệm tại các công ty công nghệ hàng đầu, Phạm Gia Bảo phát triển công nghệ quét mã vạch và hệ thống định vị để kết nối người dùng với sản phẩm giảm giá gần nhất.",
    image: founderGiaBao,
  },
  {
    name: "Phạm Thị Hỉ",
    role: "CMO & Co-Founder",
    bio: "Với kiến thức sâu rộng về marketing và hành vi người tiêu dùng, Phạm Thị Hỉ đã xây dựng chiến lược tiếp cận thị trường hiệu quả, giúp EcoSave nhanh chóng mở rộng mạng lưới người dùng.",
    image: founderThiHi,
  },
  {
    name: "Hồ Thị Ngân",
    role: "COO & Co-Founder",
    bio: "Người đứng sau quy trình vận hành suôn sẻ và quan hệ đối tác chiến lược với các nhà bán lẻ, Hồ Thị Ngân đảm bảo nền tảng hoạt động hiệu quả và mang lại giá trị cho mọi bên tham gia.",
    image: founderThuyNgan,
  },
];

const FadeInWhenVisible = ({ children }: { children: React.ReactNode }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.5, delay: 0.2 }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
    >
      {children}
    </motion.div>
  );
};

const Founder = ({ founder, index }: { founder: FounderProps; index: number }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300 flex flex-col h-full"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      whileHover={{ y: -10 }}
    >
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/20" />
        <Image
          src={founder.image} 
          alt={founder.name}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-700 hover:scale-110"
        />
      </div>
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-gray-800">{founder.name}</h3>
        <p className="text-primary font-medium mb-3">{founder.role}</p>
        <p className="text-gray-600">{founder.bio}</p>
      </div>
    </motion.div>
  );
};

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 lg:py-28">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-light rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-light rounded-full opacity-20 blur-3xl" />
        
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Về <span className="text-secondary">EcoSave</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8">
                Chúng tôi kết nối người tiêu dùng thông minh với sản phẩm giảm giá gần nhất và giúp giảm lãng phí thực phẩm thông qua công nghệ quét mã vạch tiên tiến.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/download">
                  <div className="bg-white text-primary font-medium py-3 px-6 rounded-full hover:bg-secondary hover:shadow-md transition-all duration-300">
                    Tải ứng dụng
                  </div>
                </Link>
                <Link href="/contact">
                  <div className="bg-transparent border-2 border-white/50 text-white font-medium py-3 px-6 rounded-full hover:bg-white/10 transition-all duration-300">
                    Liên hệ với chúng tôi
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Sứ mệnh của chúng tôi</h2>
              <p className="text-lg text-gray-600">
                Tại EcoSave, chúng tôi tin rằng công nghệ có thể giúp mọi người tiết kiệm tiền và giảm lãng phí thực phẩm. 
                Thông qua nền tảng của mình, chúng tôi giúp người tiêu dùng tìm thấy sản phẩm giảm giá gần nhất và theo dõi 
                ngày hết hạn thông qua công nghệ quét mã vạch, tạo ra một cộng đồng tiêu dùng có trách nhiệm.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FadeInWhenVisible>
              <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-strong transition-all duration-300 h-full">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Tiết kiệm thời gian</h3>
                <p className="text-gray-600">
                  Tìm kiếm nhanh chóng sản phẩm giảm giá gần nhất với vị trí của bạn, giúp tiết kiệm thời gian di chuyển và tìm kiếm.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible>
              <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-strong transition-all duration-300 h-full">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Tiết kiệm tiền</h3>
                <p className="text-gray-600">
                  Tiếp cận sản phẩm giảm giá và ưu đãi đặc biệt, giúp bạn tiết kiệm đáng kể trong chi tiêu hàng ngày.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible>
              <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-strong transition-all duration-300 h-full">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Giảm lãng phí</h3>
                <p className="text-gray-600">
                  Theo dõi ngày hết hạn sản phẩm và nhận thông báo kịp thời, giúp giảm lãng phí thực phẩm và bảo vệ môi trường.
                </p>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeInWhenVisible>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Người sáng lập</h2>
              <p className="text-lg text-gray-600">
                Gặp gỡ đội ngũ đam mê và tài năng đằng sau EcoSave, những người chia sẻ tầm nhìn về việc thay đổi cách 
                mua sắm và tiêu dùng.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {founders.map((founder, index) => (
              <Founder key={founder.name} founder={founder} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FadeInWhenVisible>
              <div className="text-center p-6">
                <div className="text-5xl font-bold mb-2">1M+</div>
                <div className="text-xl text-white/80">Người dùng đã đăng ký</div>
              </div>
            </FadeInWhenVisible>
            <FadeInWhenVisible>
              <div className="text-center p-6">
                <div className="text-5xl font-bold mb-2">300+</div>
                <div className="text-xl text-white/80">Đối tác bán lẻ</div>
              </div>
            </FadeInWhenVisible>
            <FadeInWhenVisible>
              <div className="text-center p-6">
                <div className="text-5xl font-bold mb-2">10K+</div>
                <div className="text-xl text-white/80">Sản phẩm tiết kiệm mỗi ngày</div>
              </div>
            </FadeInWhenVisible>
            <FadeInWhenVisible>
              <div className="text-center p-6">
                <div className="text-5xl font-bold mb-2">3 tỷ</div>
                <div className="text-xl text-white/80">VNĐ tiết kiệm cho người dùng</div>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-secondary rounded-2xl p-8 md:p-12 shadow-soft relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32" />
            
            <div className="relative z-10">
              <div className="md:flex items-center justify-between">
                <div className="md:w-2/3 mb-8 md:mb-0">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    Sẵn sàng tiết kiệm và giảm lãng phí?
                  </h2>
                  <p className="text-lg text-gray-600">
                    Tải ngay ứng dụng EcoSave và bắt đầu tìm kiếm những ưu đãi tốt nhất trong khu vực của bạn!
                  </p>
                </div>
                <div className="md:w-1/3 text-center md:text-right">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link href="/download">
                      <div className="inline-block bg-primary text-white font-medium py-4 px-8 rounded-full hover:bg-primary-dark transition-all duration-300">
                        Tải ứng dụng ngay
                      </div>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
