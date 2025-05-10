import type { Metadata } from "next"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { Pricing } from "@/components/pricing"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export const metadata: Metadata = {
  title: "MentorHub - Modern Mentorship, Streamlined",
  description: "Create assignments, share resources, and review code in one unified hub.",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b0b] to-[#111827] text-slate-50">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
