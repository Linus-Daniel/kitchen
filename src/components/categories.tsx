"use client"
import { motion } from 'framer-motion';
import { useState } from 'react';

const categories = [
  { id: 1, name: 'Pizza', icon: '🍕' },
  { id: 2, name: 'Burger', icon: '🍔' },
  { id: 3, name: 'Sushi', icon: '🍣' },
  { id: 4, name: 'Salad', icon: '🥗' },
  { id: 5, name: 'Dessert', icon: '🍰' },
  { id: 6, name: 'Drinks', icon: '🥤' },
];

const Categories = () => {
  const [selected, setSelected] = useState(1);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-amber-900 mb-12">Our Categories</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              className={`p-4 rounded-xl cursor-pointer flex flex-col items-center transition-all ${selected === category.id ? 'bg-amber-100 border-2 border-amber-400' : 'bg-gray-50 hover:bg-amber-50'}`}
              onClick={() => setSelected(category.id)}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              <motion.span 
                className="text-4xl mb-2"
                animate={{ scale: selected === category.id ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {category.icon}
              </motion.span>
              <span className="font-medium">{category.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;