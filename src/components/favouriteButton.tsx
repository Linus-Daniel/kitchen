import { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
  productId: string | number;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ productId }) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    const favorites: (string | number)[] = stored ? JSON.parse(stored) : [];
    setIsFavorite(favorites.includes(productId));
  }, [productId]);

  const toggleFavorite = () => {
    const stored = localStorage.getItem('favorites');
    const favorites: (string | number)[] = stored ? JSON.parse(stored) : [];

    let updatedFavorites: (string | number)[];
    if (isFavorite) {
      updatedFavorites = favorites.filter(id => id !== productId);
    } else {
      updatedFavorites = [...favorites, productId];
    }

    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite();
      }}
      className={`p-2 rounded-full ${
        isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-100'
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
    </motion.button>
  );
};

export default FavoriteButton;
