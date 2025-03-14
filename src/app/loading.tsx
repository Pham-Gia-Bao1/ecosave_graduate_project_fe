'use client';
import React from "react";
import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-white bg-opacity-75 z-50">
      <motion.div
        className="text-4xl font-bold text-green-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      >
        ECOSAVE
      </motion.div>
    </div>
  );
};

export default Loading;
