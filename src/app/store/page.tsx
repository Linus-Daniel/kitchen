"use client";
import { useState } from 'react';
import Head from 'next/head';
import StoreHero from '@/components/storeHero';
import CategoryFilter from '@/components/CartegoriesFilter';
import StoreGrid from '@/components/storeGrid';
import CartSidebar from '@/components/SideBar';
import SearchBar from '@/components/searchBar';
import { CartItem, Option, Product } from '@/types'; // Ensure these types are defined properly
import { LuShoppingCart } from 'react-icons/lu';

const StorePage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // CartItem type
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false); // boolean for cart open state
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // string for category
  const [searchQuery, setSearchQuery] = useState<string>(''); // string for search query

  const addToCart = (product: Product, selectedOption: Option | null = null) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id && item.selectedOption === selectedOption);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && item.selectedOption === selectedOption
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevItems, 
        { ...product, quantity: 1, selectedOption }
      ];
    });
  };

  const removeFromCart = (productId:string, selectedOption: Option | null = null) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId || item.selectedOption !== selectedOption)
    );
  };

  const updateQuantity = (productId:string, newQuantity: number, selectedOption: Option | null = null) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId && item.selectedOption === selectedOption
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  return (
    <>
      <Head>
        <title>FoodExpress - Our Menu</title>
        <meta name="description" content="Browse our delicious menu" />
      </Head>

      <StoreHero />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <StoreGrid
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          addToCart={addToCart}
          openCart={() => setIsCartOpen(true)}
          showFavorites
        
        />
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
      />

      {/* Floating cart button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition-colors z-40 flex items-center"
      >
        <span className="relative">
          <LuShoppingCart size={30} />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {cartItems.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </span>
      </button>
    </>
  );
};

export default StorePage;
