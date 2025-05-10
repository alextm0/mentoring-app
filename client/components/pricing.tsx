"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started with mentorship",
    features: ["Up to 3 mentees", "Basic assignment creation", "Code submission & review", "Resource sharing"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Everything you need for professional mentorship",
    features: [
      "Unlimited mentees",
      "Advanced assignment templates",
      "Inline code review with annotations",
      "Resource library with categories",
      "Progress analytics & reporting",
      "Custom branding",
    ],
    cta: "Join Waitlist",
    popular: true,
  },
]

export function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="pricing" className="relative py-24 md:py-32" ref={ref}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-slate-400">Choose the plan that fits your mentorship needs</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative overflow-hidden rounded-2xl ${
                plan.popular
                  ? "bg-gradient-to-b from-black/40 to-black/60 backdrop-blur-xl"
                  : "bg-black/30 backdrop-blur-xl"
              } p-8 shadow-xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -right-12 top-8 rotate-45 bg-emerald-400 px-12 py-1 text-center text-sm font-semibold text-black">
                  Popular
                </div>
              )}

              <div className="relative">
                <h3 className="text-2xl font-bold text-slate-50">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-slate-50">{plan.price}</span>
                  {plan.period && <span className="ml-1 text-slate-400">{plan.period}</span>}
                </div>
                <p className="mt-2 text-slate-400">{plan.description}</p>

                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="mr-3 h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <a
                    href="#"
                    className={`block w-full rounded-md ${
                      plan.popular
                        ? "bg-gradient-to-tr from-emerald-400 to-emerald-500 text-black"
                        : "bg-black/50 text-slate-50 hover:bg-black/70"
                    } px-4 py-3 text-center font-medium transition-all duration-200 hover:scale-105 active:scale-95`}
                    aria-label={plan.cta}
                  >
                    {plan.cta}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
