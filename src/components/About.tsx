"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function About() {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="about" className="py-20 md:py-32 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.2 }}
          >
            <motion.div variants={variants} className="mb-8">
              <span className="text-sm tracking-widest text-amber-500">
                OUR PHILOSOPHY
              </span>
              <h2 className="text-4xl md:text-5xl font-light mt-2 mb-6">
                Designing for <br />
                <span className="italic">human experience</span>
              </h2>
            </motion.div>

            <motion.p
              variants={variants}
              className="text-stone-600 mb-6 leading-relaxed"
            >
              Founded in 2015, Rossi Architecture redefines spaces through
              innovative design that harmonizes form, function, and environment.
              Our approach blends technical precision with artistic vision to
              create architecture that inspires.
            </motion.p>

            <motion.div variants={variants} className="grid grid-cols-2 gap-4">
              {[
                { value: "150+", label: "Projects Completed" },
                { value: "28", label: "Industry Awards" },
                { value: "12", label: "Countries" },
                { value: "100%", label: "Client Satisfaction" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-stone-200 rounded-lg"
                >
                  <h3 className="text-2xl font-light text-amber-500">
                    {item.value}
                  </h3>
                  <p className="text-sm text-stone-500">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden"
          >
            <Image
              src="/images/logo.png"
              alt="Rossi Architecture Studio"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-stone-900/10 to-transparent" />
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute bottom-8 left-8 text-white"
            >
              <p className="text-sm">Wisdom Umason</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}