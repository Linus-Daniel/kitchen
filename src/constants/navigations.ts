
export const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "dashboard",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: "shoppingCart",
    count: 12,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: "package",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: "users",
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: "creditCard",
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: "fileText",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: "settings",
  },
];

export const orderStatuses = [
  { value: "Pending", label: "Pending" },
  { value: "Processing", label: "Processing" },
  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancelled", label: "Cancelled" },
];

export const paymentStatuses = [
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Failed", label: "Failed" },
  { value: "Refunded", label: "Refunded" },
];

export const productCategories = [
  { value: "pizza", label: "Pizza" },
  { value: "burger", label: "Burger" },
  { value: "pasta", label: "Pasta" },
  { value: "salad", label: "Salad" },
  { value: "dessert", label: "Dessert" },
  { value: "drink", label: "Drink" },
];