
import Hero from "@/components/sections/Hero";
import PartnersSlider from "@/components/sections/PartnersSlider";
import MarketOpportunity from "@/components/sections/MarketOpportunity";
import CertificationTrust from "@/components/sections/CertificationTrust";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PartnersSlider />
        <MarketOpportunity />
        <CertificationTrust />
      </main>
      <Footer />
    </>
  );
}
