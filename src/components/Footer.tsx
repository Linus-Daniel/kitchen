"use client"
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {


  const pathName = usePathname()


  if (pathName.startsWith('/admin')) return null;
  return (
    <footer className="bg-amber-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-4">FoodExpress</h3>
            <p className="text-amber-200">Delivering happiness to your doorstep since 2023.</p>
          </motion.div>
          
          {['Quick Links', 'Categories', 'Contact', 'Follow Us'].map((title, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <h4 className="text-xl font-bold mb-4">{title}</h4>
              <ul className="space-y-2">
                {i === 0 && (
                  <>
                    <li><a href="#" className="hover:text-amber-300 transition-colors">Home</a></li>
                    <li><a href="#" className="hover:text-amber-300 transition-colors">Menu</a></li>
                    <li><a href="#" className="hover:text-amber-300 transition-colors">About Us</a></li>
                  </>
                )}
                {i === 1 && (
                  <>
                    <li><a href="#" className="hover:text-amber-300 transition-colors">Pizza</a></li>
                    <li><a href="#" className="hover:text-amber-300 transition-colors">Burgers</a></li>
                    <li><a href="#" className="hover:text-amber-300 transition-colors">Sushi</a></li>
                  </>
                )}
                {i === 2 && (
                  <>
                    <li>123 Food Street</li>
                    <li>hello@foodexpress.com</li>
                    <li>+1 (555) 123-4567</li>
                  </>
                )}
                {i === 3 && (
                  <div className="flex gap-4">
                    <motion.a 
                      href="#" 
                      whileHover={{ y: -3 }}
                      className="text-2xl"
                    >
                      <FiFacebook />
                    </motion.a>
                    <motion.a 
                      href="#" 
                      whileHover={{ y: -3 }}
                      className="text-2xl"
                    >
                      <FiTwitter />
                    </motion.a>
                    <motion.a 
                      href="#" 
                      whileHover={{ y: -3 }}
                      className="text-2xl"
                    >
                      <FiInstagram />
                    </motion.a>
                  </div>
                )}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="border-t border-amber-800 mt-12 pt-8 text-center text-amber-300"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p>© {new Date().getFullYear()} FoodExpress. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;