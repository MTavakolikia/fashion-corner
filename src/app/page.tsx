import { Banner } from "@/components/root/Banner";
import { BrandShowcase } from "@/components/root/BrandShowcase";
import CategoriesIcon from "@/components/root/Categories";
import { FeaturedProducts } from "@/components/root/FeaturedProducts";
import { Newsletter } from "@/components/root/Newsletter";
import { SpecialOffers } from "@/components/root/SpecialOffers";

export default function Home() {
  return (
    <>
      <Banner />
      <CategoriesIcon />
      <FeaturedProducts />
      <SpecialOffers />
      <BrandShowcase />
      <Newsletter />
    </>
  );
}
