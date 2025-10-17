"use client";
import { motion } from "framer-motion";
import { FiPlus, FiStar, FiClock } from "react-icons/fi";
import FavoriteButton from "./favouriteButton";
import { Product } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cartStore";

type Props = {
  product: Product;
  onSelect: () => void;
  showFavorite: boolean;
};

const ProductCard = ({ product, onSelect, showFavorite = true }: Props) => {

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden border border-gray-100"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onSelect}
    >
      {/* Favorite button */}
      {showFavorite && (
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton productId={product._id} />
        </div>
      )}

      {/* Product image with gradient overlay */}
      <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-100 relative overflow-hidden">
        <motion.img
          src={product.images?.[0] || '/placeholder-food.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
          ${product.price.toFixed(2)}
        </div>

        {/* Dietary badges */}
        {product.dietary && product.dietary.length > 0 && (
          <div className="absolute top-3 left-3 flex gap-1">
            {product.dietary.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-white/90 backdrop-blur-sm text-green-800 text-xs rounded-full font-medium shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center">
              <FiStar className="text-amber-500 mr-1" />
              <span className="font-medium">{product.rating}</span>
            </div>
            <div className="flex items-center">
              <FiClock className="mr-1" />
              <span>{product.cookTime || '30 min'}</span>
            </div>
          </div>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiPlus />
          </motion.button>
        </div>
      </div>

      {/* African pattern accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
    </motion.div>
  );
};

export default ProductCard;
