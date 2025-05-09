"use client"
import { motion } from 'framer-motion';

const categories = [
  { id: 'all', name: 'All Items' },
  { id: 'pizza', name: 'Pizza' },
  { id: 'burger', name: 'Burgers' },
  { id: 'sushi', name: 'Sushi' },
  { id: 'pasta', name: 'Pasta' },
  { id: 'dessert', name: 'Desserts' },
  { id: 'drink', name: 'Drinks' },
];

type Props = {
    selectedCategory:string;
    onSelectCategory:any
}

const CategoryFilter = ({ selectedCategory, onSelectCategory }:Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.id
              ? 'bg-amber-600 text-white'
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {category.name}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;