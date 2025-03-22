import Image from "next/image";
import { motion } from "framer-motion";
import PromoBannerImage from "../../assets/images/banner/bg-secsion3.png";
import { ArrowRight, Leaf, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PromoBanner = () => {
  return (
    <div className="relative w-full rounded-lg overflow-hidden">
      {/* Background Image */}
      <Image
        src={PromoBannerImage.src} // Thay bằng đường dẫn ảnh đúng
        alt="Promo Banner"
        width={1200}
        height={200}
        className="w-full h-auto object-cover"
      />
      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/30">
        <h2 className="text-lg font-semibold text-center">
          Góp phần giảm lãng phí thực phẩm & tiết kiệm chi phí cùng chúng tôi
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-sm">Thân thiện môi trường</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-sm">Tiết kiệm chi phí</span>
          </div>
        </div>
        <motion.div
          className="mt-2 flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/products">
            <Button className="mt-2 px-4 py-2 bg-white text-green-600 font-bold rounded-md border-dashed border-2 border-green-500 hover:bg-green-600 hover:text-white transition-colors duration-300">
              Mua sắm ngay <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PromoBanner;
