import About from "@/components/About";
import Stats from "@/components/PopularDishes";
import Blog from "@/components/Blog";
import Contact from "@/components/contact";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonial";
import Categories from "@/components/categories";
import PopularDishes from "@/components/PopularDishes";
import SpecialOffer from "@/components/SpecialOffer";

const App = () => {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <Categories />
      <PopularDishes />
      <SpecialOffer />
    

      <Footer />
    </main>
  );
};

export default App;
