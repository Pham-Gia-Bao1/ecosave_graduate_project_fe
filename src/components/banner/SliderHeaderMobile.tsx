import React, { useEffect, useRef, useState } from "react";

const SliderHeaderMobile: React.FC = () => {
  const slides = [
    "https://www.bigc.vn/files/a-31-08-2023-11-41-07/09-20-03-ng-y-h-i-n-ng-s-n-l-tb-1080big.jpg",
    "https://www.bigc.vn/files/omni-banner-31-07-2023-14-47-58/jan-2025-02-01-2025-14-52-32/09-01-22-01-mega-sale-c-ng-go-s-m-t-t-y-blog-cover-1080x540-bigc.png",
    "https://www.bigc.vn/files/omni-banner-31-07-2023-14-47-58/january-2024-05-01-2024-17-52-54/bd-ulv-omo-blog-cover-article-bigc-1080-x-540.jpg",
  ];

  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: currentIndex * sliderRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  return (
    <div className="relative w-full h-[150px] overflow-hidden">
      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
      >
        {slides.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0 snap-center">
            <img
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
