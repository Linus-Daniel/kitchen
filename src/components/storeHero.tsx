import { motion } from 'framer-motion';

const StoreHero = () => {
  return (
    <section className="relative w-full h-[80vh] overflow-hidden text-white">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/hero.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for darkening the video, optional */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10" />

      {/* Foreground Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Delicious Menu
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Browse through our selection of mouth-watering dishes and order your favorites
        </motion.p>
      </div>
    </section>
  );
};

export default StoreHero;
