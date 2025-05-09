"use client"
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const dishes = [
  { id: 1, name: 'Margherita Pizza', price: '$12.99', image: '/images/pizza.png' },
  { id: 2, name: 'Cheeseburger', price: '$8.99', image: '/images/burger.png' },
  { id: 3, name: 'California Roll', price: '$14.99', image: '/images/sushi.png' },
  { id: 4, name: 'Caesar Salad', price: '$9.99', image: '/images/salad.png' },
  { id: 5, name: 'Chocolate Cake', price: '$6.99', image: '/images/cake.png' },
];

const PopularDishes = () => {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev === dishes.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? dishes.length - 1 : prev - 1));
  };

  return (
    <section className="py-16 bg-amber-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-amber-900 mb-12">Popular Dishes</h2>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <motion.div 
              className="flex"
              animate={{ x: -current * 100 + '%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {dishes.map((dish) => (
                <div key={dish.id} className="w-full flex-shrink-0 px-4">
                  <motion.div 
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-64 bg-amber-100 flex items-center justify-center">
                      <motion.img 
                        src={dish.image} 
                        alt={dish.name}
                        className="h-48 object-contain"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold">{dish.name}</h3>
                      <p className="text-amber-600 font-bold mt-2">{dish.price}</p>
                      <button className="mt-4 bg-amber-500 text-white py-2 px-6 rounded-full hover:bg-amber-600 transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>
          
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-amber-100 transition-colors"
          >
            <FiChevronLeft size={24} />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-2 rounded-full shadow-md hover:bg-amber-100 transition-colors"
          >
            <FiChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularDishes;