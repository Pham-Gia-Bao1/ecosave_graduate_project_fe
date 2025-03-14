import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

// Define Props Type
interface FavoriteButtonProps {
  product: { id: string };
  favoriteProductIds: string[];
  toggleFavorite: (product: { id: string }) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ product, favoriteProductIds, toggleFavorite }) => {
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = () => {
    toggleFavorite(product);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 500); // Hide particles after 500ms
  };

  return (
    <div className="relative">
      {/* Button */}
      <motion.button
        className={`p-2 border rounded-full transition-all duration-300 ${
          favoriteProductIds.includes(product.id)
            ? "bg-orange-500 text-white"
            : "bg-white text-red-500 hover:bg-red-500 hover:text-white"
        }`}
        onClick={handleClick}
        whileTap={{ scale: 0.8 }}
        animate={{ scale: favoriteProductIds.includes(product.id) ? [1, 1.2, 1] : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 10 }}
      >
        {favoriteProductIds.includes(product.id) ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
      </motion.button>

      {/* Particles */}
      <AnimatePresence>
        {showParticles && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-red-500 rounded-full"
                initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  x: (Math.random() - 0.5) * 40,
                  y: (Math.random() - 0.5) * 40,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavoriteButton;
