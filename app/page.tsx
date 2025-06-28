import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import HeroContentSection from "@/components/hero-content-section"
import CompanyTieup from "@/components/company-tieup"
import Services from "@/components/services"
import Features from "@/components/features"
import Testimonials from "@/components/testimonials"
import LearnWithUs from "@/components/learn-with-us"
import FAQ from "@/components/faq"
import ContactUs from "@/components/contact-us"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <HeroContentSection />
      <CompanyTieup />
      <Services />
      <Features />
      <Testimonials />
      <LearnWithUs />
      <FAQ />
      <ContactUs />
      <Footer />
    </div>
  )
}
