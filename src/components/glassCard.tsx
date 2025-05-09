'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import Image from 'next/image';

interface GlassCardProps {
  title: string;
  content: string;
  imageUrl: string | any ;
  animationDirection?: 'up' | 'down' | 'left' | 'right';
}

const directionVariants = {
  up: { y: 50, opacity: 0 },
  down: { y: -50, opacity: 0 },
  left: { x: 50, opacity: 0 },
  right: { x: -50, opacity: 0 },
};

const GlassCard: React.FC<GlassCardProps> = ({
  title,
  content,
  imageUrl,
  animationDirection = 'up',
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({ x: 0, y: 0, opacity: 1 });
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      initial={directionVariants[animationDirection]}
      animate={controls}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white/10 backdrop-blur-md hidden md:block border border-white/20 h-[70vh] rounded-2xl shadow-xl p-4 max-w-sm w-full text-white"
    >
      <Image 
   width={1500}
   height={250}
        src={imageUrl}
        alt={title}
        className="rounded-xl   object-cover mb-4"
      />
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-200">{content}</p>
    </motion.div>
  );
};

export default GlassCard;
