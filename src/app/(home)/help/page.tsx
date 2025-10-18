'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle,
  User,
  CreditCard,
  Truck,
  ShoppingBag,
  Shield,
  MapPin,
  Star,
  AlertCircle
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ContactInfo {
  type: 'phone' | 'email' | 'chat';
  title: string;
  value: string;
  hours?: string;
  icon: React.ReactNode;
}

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const categories = [
    { id: 'all', name: 'All Topics', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'orders', name: 'Orders & Delivery', icon: <Truck className="w-5 h-5" /> },
    { id: 'payments', name: 'Payments & Billing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'account', name: 'Account & Profile', icon: <User className="w-5 h-5" /> },
    { id: 'restaurants', name: 'Restaurants & Menu', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'technical', name: 'Technical Issues', icon: <AlertCircle className="w-5 h-5" /> },
    { id: 'safety', name: 'Safety & Security', icon: <Shield className="w-5 h-5" /> }
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'orders',
      question: 'How do I track my order?',
      answer: 'You can track your order in real-time by going to "My Orders" and clicking on the specific order. You\'ll see live updates including preparation, pickup, and delivery status with estimated times.'
    },
    {
      id: '2',
      category: 'orders',
      question: 'What if my order is late?',
      answer: 'If your order is significantly delayed, you\'ll receive automatic notifications with updated delivery times. You can also contact the restaurant directly through the order tracking page or reach out to our support team for assistance.'
    },
    {
      id: '3',
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 2-3 minutes of placing it, before the restaurant starts preparation. After that, you\'ll need to contact the restaurant directly or our support team.'
    },
    {
      id: '4',
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards (Visa, Mastercard, Verve), bank transfers, and mobile money payments through Paystack. All payments are processed securely.'
    },
    {
      id: '5',
      category: 'payments',
      question: 'How do refunds work?',
      answer: 'Refunds are processed automatically for cancelled orders and typically appear in your account within 3-5 business days. For order issues, refunds are processed after review and verification.'
    },
    {
      id: '6',
      category: 'payments',
      question: 'Why was my payment declined?',
      answer: 'Payment declines can happen due to insufficient funds, incorrect card details, or bank restrictions. Please verify your information and try again, or contact your bank if issues persist.'
    },
    {
      id: '7',
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions in the reset email. Make sure to check your spam folder if you don\'t see the email.'
    },
    {
      id: '8',
      category: 'account',
      question: 'How do I update my delivery address?',
      answer: 'Go to Account Settings > Delivery Addresses to add, edit, or delete addresses. You can set a default address and add multiple locations for convenience.'
    },
    {
      id: '9',
      category: 'restaurants',
      question: 'How do I find restaurants near me?',
      answer: 'Our app automatically detects your location and shows nearby restaurants. You can also manually enter an address in the search bar or browse by cuisine type and ratings.'
    },
    {
      id: '10',
      category: 'restaurants',
      question: 'What if a restaurant is closed?',
      answer: 'Closed restaurants are marked clearly with their next opening time. You can save them to favorites and get notified when they reopen, or browse similar restaurants that are currently open.'
    },
    {
      id: '11',
      category: 'technical',
      question: 'The app is not working properly',
      answer: 'Try refreshing the page, clearing your browser cache, or updating to the latest version. If problems persist, contact support with details about your device and browser.'
    },
    {
      id: '12',
      category: 'safety',
      question: 'How do you ensure food safety?',
      answer: 'All our partner restaurants follow strict food safety standards. Delivery personnel use insulated bags, and we have a rating system to maintain quality standards across our platform.'
    }
  ];

  const contactOptions: ContactInfo[] = [
    {
      type: 'phone',
      title: 'Call Us',
      value: '+234 701 234 5678',
      hours: '24/7 Support',
      icon: <Phone className="w-6 h-6" />
    },
    {
      type: 'email',
      title: 'Email Support',
      value: 'support@kitchenmode.com',
      hours: 'Response within 24 hours',
      icon: <Mail className="w-6 h-6" />
    },
    {
      type: 'chat',
      title: 'Live Chat',
      value: 'Start Chat',
      hours: 'Mon-Sun, 8AM-10PM',
      icon: <MessageCircle className="w-6 h-6" />
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });

      if (response.ok) {
        alert('Your message has been sent successfully! We\'ll get back to you soon.');
        setContactForm({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'general'
        });
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help you?</h1>
            <p className="text-xl text-orange-100 mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse Topics</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Quick Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Immediate Help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contactOptions.map((option) => (
                  <motion.div
                    key={option.type}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center"
                  >
                    <div className="text-orange-500 mb-4 flex justify-center">
                      {option.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-2">{option.value}</p>
                    <p className="text-sm text-gray-500">{option.hours}</p>
                    <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors">
                      {option.type === 'chat' ? 'Start Chat' : 'Contact Now'}
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
                {filteredFAQs.length > 0 && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({filteredFAQs.length} results)
                  </span>
                )}
              </h2>
              
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or browse different categories
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                        {expandedFAQ === faq.id ? (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedFAQ === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-gray-200"
                          >
                            <div className="px-6 py-4 text-gray-700 leading-relaxed">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Contact Form */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={contactForm.category}
                        onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="orders">Order Issue</option>
                        <option value="payments">Payment Problem</option>
                        <option value="technical">Technical Issue</option>
                        <option value="feedback">Feedback</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Please provide as much detail as possible about your issue or question..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition-colors font-medium"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Order Status Guide</h3>
              <p className="text-gray-600 text-sm">
                Learn about different order statuses and what they mean
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Star className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Rating & Reviews</h3>
              <p className="text-gray-600 text-sm">
                How to rate orders and leave reviews for restaurants
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Delivery Areas</h3>
              <p className="text-gray-600 text-sm">
                Check if we deliver to your area and delivery fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;