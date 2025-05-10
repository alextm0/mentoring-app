"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { CloudLightningIcon as Lightning, BracketsIcon as CodeBrackets, BookOpen, LineChart } from "lucide-react"

const features = [
  {
    icon: <Lightning className="h-6 w-6 text-emerald-400" />,
    title: "Assignment Builder",
    description: "Post coding tasks in seconds.",
  },
  {
    icon: <CodeBrackets className="h-6 w-6 text-emerald-400" />,
    title: "Inline Code Review",
    description: "Add line-by-line feedback with syntax highlighting.",
  },
  {
    icon: <BookOpen className="h-6 w-6 text-emerald-400" />,
    title: "Resource Library",
    description: "Curated links & docs right inside the dashboard.",
  },
  {
    icon: <LineChart className="h-6 w-6 text-emerald-400" />,
    title: "Progress Analytics",
    description: "Track submissions and skill growth over time.",
  },
]

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section id="features" className="relative py-24 md:py-32" ref={ref}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">Powerful Features</h2>
          <p className="mt-4 text-lg text-slate-400">Everything you need to manage mentorship effectively</p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-black/30 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:translate-y-1 hover:shadow-xl"
              variants={itemVariants}
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-emerald-500/5 opacity-0 blur-lg transition-all duration-300 group-hover:opacity-100"></div>
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-50">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
