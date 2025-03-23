"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export const ScanLine = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      y: ["0%", "100%"], // Quét từ trên xuống dưới div
      transition: { repeat: Infinity, duration: 1.8, ease: "linear" },
    });
  }, [controls]);

  return (
    <motion.div
      className="scanline"
      animate={controls}
    />
  );
};
