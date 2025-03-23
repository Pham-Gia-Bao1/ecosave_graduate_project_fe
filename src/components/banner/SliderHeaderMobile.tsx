import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

interface SliderHeaderMobileProps {
  slides: string[];
}

const SliderHeaderMobile: React.FC<SliderHeaderMobileProps> = ({ slides }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: currentIndex * sliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  return (
    <div className="relative w-full h-[150px] lg:h-full overflow-hidden">
      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
      >
        {slides.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0 snap-center">
            <Image
              width={200}
              height={200}
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Indicator Dots */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white scale-125" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SliderHeaderMobile;
