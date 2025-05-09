'use client';

import { useEffect, useState } from 'react';
import StoreGrid from '@/components/storeGrid';
import productDatas from '@/constants/foodData';
import { Product } from '@/types';
import Link from 'next/link';

const FavoritesPage = () => {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  const products: Product[] = productDatas;

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    const favoriteIds: (string | number)[] = stored ? JSON.parse(stored) : [];

    const favProducts = products.filter(product =>
      favoriteIds.includes(product.id)
    );
    setFavoriteProducts(favProducts);
  }, [products]);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">Your Favorite Dishes</h1>

        {favoriteProducts.length > 0 ? (
          <StoreGrid
            products={favoriteProducts}
            addToCart={() => {}} // optional dummy function
            showFavorites={false}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">You haven't added any favorites yet</p>
            <Link href="/store">
              <p className="text-amber-600 hover:underline">Browse our menu</p>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FavoritesPage;
