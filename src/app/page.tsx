import { Banner } from "@/components/root/Banner";
import { BrandShowcase } from "@/components/root/BrandShowcase";
import CategoriesIcon from "@/components/root/Categories";
import { FeaturedProducts } from "@/components/root/FeaturedProducts";
import { Newsletter } from "@/components/root/Newsletter";
import { SpecialOffers } from "@/components/root/SpecialOffers";
import { Footer } from "@/components/root/Footer";
import Navbar from "@/components/root/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav>
        <Navbar />
      </nav>
      <main className="flex-grow mt-20">
        <Banner />
        <CategoriesIcon />
        <FeaturedProducts />
        <SpecialOffers />
        <BrandShowcase />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
