"use client"
import { motion } from 'framer-motion';

const AboutPage = () => {
  const features = [
    {
      title: "Fast Delivery",
      description: "Get your food delivered in under 30 minutes or it's free.",
      icon: "🚀"
    },
    {
      title: "Fresh Ingredients",
      description: "We use only the freshest ingredients from local suppliers.",
      icon: "🥬"
    },
    {
      title: "Diverse Menu",
      description: "From local favorites to international cuisine, we have it all.",
      icon: "🌍"
    },
    {
      title: "24/7 Support",
      description: "Our customer service team is always ready to help.",
      icon: "📞"
    }
  ];

  return (
    <div>
      <section className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About FoodExpress
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Delivering delicious meals with love since 2015
          </motion.p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-amber-900 mb-4">Our Story</h2>
            <p className="text-gray-600">
              Founded in 2015, FoodExpress started as a small family-owned restaurant with a passion for 
              great food and excellent service. As our delicious meals gained popularity, we expanded 
              into food delivery to share our culinary creations with more people. Today, we partner 
              with the best restaurants in town to bring you a diverse menu of high-quality dishes 
              delivered straight to your door.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-amber-50 rounded-xl p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-amber-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-amber-900 mb-6">Our Team</h2>
            <p className="text-gray-600 mb-12">
              Meet the passionate people behind FoodExpress who work tirelessly to bring you 
              the best dining experience.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "Founder & CEO", image: "/images/team1.jpg" },
              { name: "Michael Chen", role: "Head Chef", image: "/images/team2.jpg" },
              { name: "Emily Rodriguez", role: "Delivery Manager", image: "/images/team3.jpg" },
              { name: "David Kim", role: "Customer Support", image: "/images/team4.jpg" },
              { name: "Jessica Wong", role: "Marketing Director", image: "/images/team5.jpg" },
              { name: "Robert Smith", role: "Technology Lead", image: "/images/team6.jpg" }
            ].map((member, index) => (
              <motion.div
                key={member.name}
                className="bg-white rounded-xl overflow-hidden shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-amber-900 mb-1">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;