import NavBar from "../components/landing/NavBar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Stats from "../components/landing/Stats";
import Testimonials from "../components/landing/Testimonials";
import Pricing from "../components/landing/Pricing";
import Faq from "../components/landing/Faq";
import Footer from "../components/landing/Footer";
import Cta from "../components/landing/Cta";
import AnimatedTextHalf from "../components/landing/AnimatedTextHalf";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-dvh">
      <NavBar />
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Faq />
      <Cta />
      <Footer />
      <AnimatedTextHalf />
    </main>
  );
}
