"use client"
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

type SearchBarPropsType =  {
    searchQuery:string
    setSearchQuery: (e:any) => any
}

const SearchBar = ({ searchQuery, setSearchQuery }:SearchBarPropsType) => {
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <input
        type="text"
        placeholder="Search dishes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-4 py-2 rounded-full border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      />
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" />
    </motion.div>
  );
};

export default SearchBar;