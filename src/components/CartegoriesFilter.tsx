"use client";
import { motion } from "framer-motion";

const defaultCategories = [
  { id: "all", name: "All", icon: "🌍" },
  { id: "jollof", name: "Jollof", icon: "🍛" },
  { id: "swallow", name: "Swallow", icon: "🥣" },
  { id: "grill", name: "Grill", icon: "🔥" },
  { id: "soup", name: "Soups", icon: "🍲" },
  { id: "snacks", name: "Snacks", icon: "🥨" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
  { id: "dessert", name: "Desserts", icon: "🍯" },
];

const categoryIcons: { [key: string]: string } = {
  "all": "🌍",
  "appetizers": "🥗",
  "main-course": "🍽️",
  "desserts": "🍮",
  "beverages": "🥤",
  "salads": "🥗",
  "pizza": "🍕",
  "burgers": "🍔",
  "pasta": "🍝",
  "seafood": "🦐",
  "vegetarian": "🥬",
  "vegan": "🌱",
  "jollof": "🍛",
  "swallow": "🥣",
  "grill": "🔥",
  "soup": "🍲",
  "snacks": "🥨",
  "drinks": "🥤",
};

type Props = {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories?: string[];
};

const CategoryFilter = ({ selectedCategory, onSelectCategory, categories: propCategories }: Props) => {
  const categoriesData = propCategories 
    ? [
        { id: "all", name: "All", icon: categoryIcons["all"] },
        ...propCategories.map(cat => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
          icon: categoryIcons[cat] || "🍽️"
        }))
      ]
    : defaultCategories;

  return (
    <div className="relative">
      {/* Scrollable categories with gradient fade */}
      <div className="flex space-x-3 pb-4 overflow-x-auto no-scrollbar">
        {categoriesData.map((category, index) => (
          <motion.button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex flex-col items-center min-w-[70px] p-3 rounded-2xl transition-all duration-300 ${
              selectedCategory === category.id
                ? "bg-amber-500 shadow-lg shadow-amber-200"
                : "bg-gray-100 hover:bg-amber-50 border border-gray-200"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <span className="text-2xl mb-2">{category.icon}</span>
            <span
              className={`text-xs font-medium ${
                selectedCategory === category.id
                  ? "text-white"
                  : "text-gray-700"
              }`}
            >
              {category.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Gradient overlay for scroll indication */}
      <div className="absolute right-0 top-0 w-6 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
};

export default CategoryFilter;
