import { FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useFavoriteStatus } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

interface FavoriteButtonProps {
  productId: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ productId }) => {
  const { user } = useAuth();
  const { isFavorite, loading, toggleFavorite } = useFavoriteStatus(productId);
  const [localIsFavorite, setLocalIsFavorite] = useState<boolean>(false);

  // Handle guest favorites with localStorage
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem('favorites');
      const favorites: string[] = stored ? JSON.parse(stored) : [];
      setLocalIsFavorite(favorites.includes(productId));
    }
  }, [productId, user]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (user) {
      // Authenticated user - use API
      try {
        await toggleFavorite();
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    } else {
      // Guest user - use localStorage
      const stored = localStorage.getItem('favorites');
      const favorites: string[] = stored ? JSON.parse(stored) : [];

      let updatedFavorites: string[];
      if (localIsFavorite) {
        updatedFavorites = favorites.filter(id => id !== productId);
      } else {
        updatedFavorites = [...favorites, productId];
      }

      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setLocalIsFavorite(!localIsFavorite);
    }
  };

  const isActive = user ? isFavorite : localIsFavorite;

  return (
    <motion.button
      onClick={handleToggleFavorite}
      disabled={loading && !!user}
      className={`p-2 rounded-full transition-colors ${
        isActive ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-100'
      } ${loading && user ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={!loading ? { scale: 1.1 } : {}}
      whileTap={!loading ? { scale: 0.9 } : {}}
    >
      <FiHeart fill={isActive ? 'currentColor' : 'none'} />
    </motion.button>
  );
};

export default FavoriteButton;
