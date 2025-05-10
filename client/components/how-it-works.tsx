"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { Users, FileCode, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: <Users className="h-6 w-6 text-emerald-400" />,
    title: "Mentor creates a cohort",
    description: "Set up your mentorship program and invite mentees to join.",
  },
  {
    icon: <FileCode className="h-6 w-6 text-emerald-400" />,
    title: "Mentee submits solutions",
    description: "Mentees complete assignments and submit their code for review.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-emerald-400" />,
    title: "Mentor reviews & tracks progress",
    description: "Provide detailed feedback and monitor skill development over time.",
  },
]

export function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="relative py-24 md:py-32" ref={ref}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-slate-400">
              A streamlined process designed to make mentorship effective and efficient
            </p>

            <div className="relative mt-12">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-800 hidden lg:block"></div>

              <div className="space-y-12">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="relative flex gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/30 backdrop-blur-xl shadow-lg z-10">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-md"></div>
                        <div className="relative">{step.icon}</div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-slate-800 lg:hidden"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-50">{step.title}</h3>
                      <p className="mt-2 text-slate-400">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-emerald-500/10 blur-xl"></div>
              <div className="relative overflow-hidden rounded-2xl bg-black/30 backdrop-blur-xl p-6 shadow-2xl">
                <Image
                  src="/mentorship-illustration.png"
                  alt="Mentorship Process"
                  width={500}
                  height={400}
                  className="w-full"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHg/bGdQAAAABJRU5ErkJggg=="
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
