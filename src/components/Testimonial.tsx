"use client";
import { AnimatePresence, motion } from "framer-motion";
import { LuChevronLeft as ChevronLeft, LuChevronRight as ChevronRight  } from "react-icons/lu";
import { useState } from "react";
import Image from "next/image";

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "Rossi Architecture transformed our corporate headquarters into a space that perfectly reflects our brand identity while dramatically improving employee satisfaction and productivity.",
      author: "Sarah Chen",
      role: "CEO, TechNova Inc.",
      avatar: "/avatar-1.jpg"
    },
    {
      quote: "Working with Luca and his team was an exceptional experience. They listened to our needs and delivered a home that exceeded all our expectations in both design and functionality.",
      author: "Michael Rodriguez",
      role: "Homeowner, The Hills Residence",
      avatar: "/avatar-2.jpg"
    },
    {
      quote: "The urban renewal project led by Rossi Architecture has completely revitalized our district, creating vibrant public spaces while preserving the neighborhood's historic character.",
      author: "Elena Petrov",
      role: "City Planning Commissioner",
      avatar: "/avatar-3.jpg"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-stone-900 text-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-widest text-amber-400">
            CLIENT VOICES
          </span>
          <h2 className="text-4xl md:text-5xl font-light mt-2">
            What Our Clients Say
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-6xl text-amber-400 mb-6">"</div>
              <p className="text-xl italic mb-8">
                {testimonials[currentTestimonial].quote}
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-700">
                  <Image
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].author}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="font-medium">{testimonials[currentTestimonial].author}</p>
                  <p className="text-sm text-stone-400">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 p-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 p-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}