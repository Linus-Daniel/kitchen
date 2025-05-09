"use client"
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const Hero = () => {
  const foodItems = [
    { id: 1, name: 'Burger', top: '10%', left: '5%' },
    { id: 2, name: 'Pizza', top: '20%', left: '80%' },
    { id: 3, name: 'Sushi', top: '70%', left: '15%' },
    { id: 4, name: 'Taco', top: '60%', left: '75%' },
  ];

  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-b from-orange-50 to-amber-100">
      {/* Animated food items floating in background */}
      {foodItems.map((item) => (
        <motion.div
          key={item.id}
          className="absolute w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center"
          style={{ top: item.top, left: item.left }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="text-xl font-bold">{item.name}</span>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="container mx-auto h-full flex flex-col justify-center items-center text-center px-4">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-amber-900 mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Delicious Food <br /> Delivered to Your Door
        </motion.h1>
        
        <motion.p 
          className="text-xl text-amber-800 mb-10 max-w-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Order from your favorite restaurants with just a few clicks and enjoy a quick delivery.
        </motion.p>
        
        <motion.button
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Order Now <FiArrowRight />
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;