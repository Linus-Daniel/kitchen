import { Product } from "@/types";

export const productDatas: Product[] = [
  {
    id: 1,
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, fresh mozzarella, and basil leaves. Our signature pizza made with love and traditional Italian recipe.",
    price: 12.99,
    category: "pizza",
    image: "/images/pizzamargherita1.jpg",
    rating: 4.8,
    cookTime: "20-25 min",
    dietary: ["Vegetarian"],
    options: [
      { name: "Small (10\")", price: 0 },
      { name: "Medium (12\")", price: 2.99 },
      { name: "Large (14\")", price: 4.99 },
      { name: "Extra Cheese", price: 1.99 }
    ],
    ingredients: ["Pizza dough", "Tomato sauce", "Fresh mozzarella", "Basil", "Olive oil"]
  },
  {
    id: 2,
    name: "Pepperoni Pizza",
    description: "Traditional pizza with spicy pepperoni and mozzarella cheese. Perfect for meat lovers with just the right amount of spice.",
    price: 14.99,
    category: "pizza",
    image: "/images/pepperoni.jpg",
    rating: 4.9,
    cookTime: "20-25 min",
    options: [
      { name: "Small (10\")", price: 0 },
      { name: "Medium (12\")", price: 2.99 },
      { name: "Large (14\")", price: 4.99 },
      { name: "Extra Pepperoni", price: 2.99 }
    ],
    ingredients: ["Pizza dough", "Tomato sauce", "Mozzarella", "Pepperoni", "Spices"]
  },
  {
    id: 3,
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with cheese, lettuce, tomato, pickles, and our special sauce on a toasted sesame bun.",
    price: 8.99,
    category: "burger",
    image: "/images/classicalBurger.avif",
    rating: 4.7,
    cookTime: "10-15 min",
    options: [
      { name: "Single", price: 0 },
      { name: "Double", price: 3.99 },
      { name: "Bacon", price: 1.99 }
    ],
    ingredients: ["Beef patty", "Cheddar cheese", "Lettuce", "Tomato", "Pickles", "Sesame bun", "Special sauce"]
  },
  {
    id: 4,
    name: "California Roll",
    description: "Fresh sushi roll with crab meat, avocado, and cucumber wrapped in seaweed and rice.",
    price: 10.99,
    category: "sushi",
    image: "/images/California-rolls-sushi.webp",
    rating: 4.6,
    cookTime: "15-20 min",
    dietary: ["Pescatarian"],
    options: [],
    ingredients: ["Sushi rice", "Seaweed", "Crab meat", "Avocado", "Cucumber"]
  },
  {
    id: 5,
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta dish made with eggs, Parmesan, pancetta, and pepper.",
    price: 11.99,
    category: "pasta",
    image: "/images/spagetti.avif",
    rating: 4.5,
    cookTime: "15-20 min",
    options: [],
    ingredients: ["Spaghetti", "Eggs", "Parmesan cheese", "Pancetta", "Black pepper"]
  },
  {
    id: 6,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a gooey molten center, served with a scoop of vanilla ice cream.",
    price: 6.99,
    category: "dessert",
    image: "/images/updated-lava-cakes7.webp",
    rating: 4.9,
    cookTime: "10-15 min",
    dietary: ["Vegetarian"],
    options: [],
    ingredients: ["Dark chocolate", "Butter", "Sugar", "Eggs", "Flour"]
  },
  {
    id: 7,
    name: "Iced Caramel Latte",
    description: "Chilled espresso with creamy milk and rich caramel syrup over ice.",
    price: 4.99,
    category: "drink",
    image: "/images/caramel-latte-11.jpg",
    rating: 4.4,
    cookTime: "5 min",
    options: [
      { name: "Regular", price: 0 },
      { name: "Large", price: 1.00 },
      { name: "Add Whipped Cream", price: 0.5 }
    ],
    ingredients: ["Espresso", "Milk", "Caramel syrup", "Ice"]
  },
  {
    id: 8,
    name: "Veggie Burger",
    description: "Delicious plant-based patty with lettuce, tomato, and vegan mayo on a whole grain bun.",
    price: 9.99,
    category: "burger",
    image: "/images/veganBurger.jpg",
    rating: 4.3,
    cookTime: "10-15 min",
    dietary: ["Vegan"],
    options: [
      { name: "Single", price: 0 },
      { name: "Double Patty", price: 2.49 }
    ],
    ingredients: ["Plant-based patty", "Lettuce", "Tomato", "Vegan mayo", "Whole grain bun"]
  }
];

export default productDatas;
