import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import Booking from "@/components/Booking";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <div className="h-16 md:h-24" />
      <div className="divider" />
      <div className="h-16 md:h-24" />
      <Gallery />
      <div className="h-16 md:h-24" />
      <div className="divider" />
      <div className="h-16 md:h-24" />
      <Booking />
      <div className="h-16 md:h-24" />
      <div className="divider" />
      <div className="h-16 md:h-24" />
      <Contact />
      <div className="h-16 md:h-24" />
      <Footer />
    </main>
  );
}
