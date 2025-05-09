"use client";
import { motion } from "framer-motion";
import { LuBuilding as Building, LuHouse as Home, LuLandPlot as LandPlot, LuDraftingCompass as DraftingCompass } from "react-icons/lu";

export default function Services() {
  const services = [
    {
      icon: <DraftingCompass className="w-8 h-8" />,
      title: "Concept Design",
      description: "Transforming visions into innovative architectural concepts through sketches, 3D models, and feasibility studies."
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Residential",
      description: "Bespoke homes that blend functionality with aesthetic excellence, tailored to your lifestyle needs."
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Commercial",
      description: "Office spaces, retail environments, and mixed-use developments designed to enhance business operations."
    },
    {
      icon: <LandPlot className="w-8 h-8" />,
      title: "Urban Planning",
      description: "Comprehensive community designs that balance growth with environmental and social considerations."
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6 }
    })
  };

  return (
    <section id="services" className="py-20 bg-stone-100">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-widest text-amber-500">
            OUR EXPERTISE
          </span>
          <h2 className="text-4xl md:text-5xl font-light mt-2">
            Comprehensive Architectural Services
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="text-amber-500 mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-light mb-3">{service.title}</h3>
              <p className="text-stone-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}