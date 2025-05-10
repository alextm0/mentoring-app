"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    quote: "MentorHub transformed how I teach programming. The inline code review feature saves me hours each week.",
    author: "Sarah Johnson",
    role: "Senior Developer & Mentor",
  },
  {
    quote:
      "The structured assignments and feedback system helped me improve my coding skills faster than any course I've taken.",
    author: "Michael Chen",
    role: "Frontend Developer",
  },
  {
    quote:
      "Managing multiple mentees used to be chaotic. Now I have everything organized in one place with clear progress tracking.",
    author: "Alex Rodriguez",
    role: "Tech Lead & Mentor",
  },
]

export function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const next = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="relative py-24 md:py-32" ref={ref}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">What Our Users Say</h2>
          <p className="mt-4 text-lg text-slate-400">Hear from mentors and mentees using MentorHub</p>
        </motion.div>

        <div className="relative mx-auto max-w-4xl">
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-black/30 backdrop-blur-xl border-l-2 border-emerald-400 p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            <Quote className="absolute right-8 top-8 h-12 w-12 text-emerald-400/20" />

            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-opacity duration-500 ${
                    current === index ? "opacity-100" : "absolute inset-0 opacity-0"
                  }`}
                >
                  <blockquote className="text-xl text-slate-200 md:text-2xl">"{testimonial.quote}"</blockquote>
                  <div className="mt-6">
                    <p className="font-semibold text-slate-50">{testimonial.author}</p>
                    <p className="text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-8 right-8 flex space-x-2">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-slate-400 transition-colors hover:bg-black/70 hover:text-emerald-400"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-slate-400 transition-colors hover:bg-black/70 hover:text-emerald-400"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>

          <div className="mt-6 flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setAutoplay(false)
                  setCurrent(index)
                }}
                className={`h-2 w-2 rounded-full transition-colors ${
                  current === index ? "bg-emerald-400" : "bg-slate-700"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
