import FeaturesSection from "./_components/FeaturesSection";
import Footer from "./_components/FooterSection";
import HeroSection from "./_components/HeroSection";
import Navbar from "./_components/Navbar";
import PricingSection from "./_components/PricingSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </>
  );
}
