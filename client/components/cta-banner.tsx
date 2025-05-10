"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"

export function CtaBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="relative py-24 md:py-32" ref={ref}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-radial from-emerald-500/20 via-emerald-500/5 to-transparent"></div>

          <div className="relative px-6 py-16 sm:px-12 sm:py-20 md:px-16 md:py-24 text-center">
            <motion.h2
              className="text-3xl font-bold text-slate-50 sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Ready to level up your mentorship?
            </motion.h2>

            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg text-slate-300"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join thousands of mentors and mentees who are transforming the way they learn and teach coding.
            </motion.p>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-gradient-to-tr from-emerald-400 to-emerald-500 px-8 py-4 text-lg font-medium text-black shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Create your free workspace"
              >
                <span className="relative z-10">Create Your Free Workspace</span>
                <span className="absolute inset-0 z-0 bg-gradient-to-tr from-emerald-400 to-emerald-500 opacity-0 transition-opacity group-hover:opacity-100"></span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
