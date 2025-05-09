import { Product } from "@/types";

export const products:Product[] = [
  {
    id: 1,
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and basil",
    price: 12.99,
    category: "pizza",
    image: "/images/pizzamargherita1.jpg",
    rating: 4.8,
    cookTime: "20-25 min",
  },
  {
    id: 2,
    name: "Pepperoni Pizza",
    description: "Traditional pizza with spicy pepperoni and mozzarella",
    price: 14.99,
    category: "pizza",
    image: "/images/pepperoni.jpg",
    rating: 4.9,
    cookTime: "20-25 min"
  },
  {
    id: 3,
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with cheese, lettuce, and special sauce",
    price: 8.99,
    category: "burger",
    image: "/images/classicalBurger.avif",
    rating: 4.7,
    cookTime: "10-15 min"
  },
  {
    id: 4,
    name: "California Roll",
    description: "Fresh sushi roll with crab, avocado and cucumber",
    price: 10.99,
    category: "sushi",
    image: "/images/California-rolls-sushi.webp",
    rating: 4.6,
    cookTime: "15-20 min"
  },
  {
    id: 5,
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta with eggs, cheese, pancetta, and pepper",
    price: 11.99,
    category: "pasta",
    image: "/images/spagetti.avif",
    rating: 4.5,
    cookTime: "15-20 min"
  },
  {
    id: 6,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with ice cream",
    price: 6.99,
    category: "dessert",
    image: "/images/updated-lava-cakes7.webp",
    rating: 4.9,
    cookTime: "10-15 min"
  },
  {
    id: 7,
    name: "Iced Caramel Latte",
    description: "Espresso with milk, caramel syrup and ice",
    price: 4.99,
    category: "drink",
    image: "/images/caramel-latte-11.jpg",
    rating: 4.4,
    cookTime: "5 min"
  },
  {
    id: 8,
    name: "Veggie Burger",
    description: "Plant-based patty with lettuce, tomato and vegan mayo",
    price: 9.99,
    category: "burger",
    image: "/images/veganBurger.jpg",
    rating: 4.3,
    cookTime: "10-15 min"
  }
];
