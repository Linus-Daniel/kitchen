"use client"
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const SpecialOffer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const { hours, minutes, seconds } = prev;
        
        if (seconds > 0) return { ...prev, seconds: seconds - 1 };
        if (minutes > 0) return { hours, minutes: minutes - 1, seconds: 59 };
        if (hours > 0) return { hours: hours - 1, minutes: 59, seconds: 59 };
        
        clearInterval(timer);
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Special Offer!</h2>
          <p className="text-xl mb-8">Get 20% off on all orders above $30. Offer ends soon!</p>
          
          <div className="flex justify-center gap-4 mb-8">
            <motion.div 
              className="bg-white/20 rounded-lg p-4 text-center min-w-[80px]"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-sm">Hours</div>
            </motion.div>
            
            <motion.div 
              className="bg-white/20 rounded-lg p-4 text-center min-w-[80px]"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-sm">Minutes</div>
            </motion.div>
            
            <motion.div 
              className="bg-white/20 rounded-lg p-4 text-center min-w-[80px]"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-sm">Seconds</div>
            </motion.div>
          </div>
          
          <motion.button
            className="bg-white text-amber-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-amber-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Order Now & Save
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default SpecialOffer;