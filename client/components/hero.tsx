"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create stars
    const stars: { x: number; y: number; radius: number; opacity: number; speed: number }[] = []
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.8,
        speed: Math.random() * 0.05,
      })
    }

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(52, 211, 153, ${star.opacity})`
        ctx.fill()

        // Move stars
        star.y += star.speed
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(circle at center, #111827 0%, #0b0b0b 100%)" }}
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <motion.h1
            className="text-6xl font-bold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300 md:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Modern Mentorship, Streamlined.
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-lg text-slate-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Create assignments, share resources, and review code in one unified hub.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href="/signup"
              className="group relative overflow-hidden rounded-md bg-gradient-to-tr from-emerald-400 to-emerald-500 px-6 py-3 text-black shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Get started with MentorHub"
            >
              <span className="relative z-10 font-medium">Get Started</span>
              <span className="absolute inset-0 z-0 bg-gradient-to-tr from-emerald-400 to-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>

            <Link
              href="/demo"
              className="group flex items-center space-x-2 rounded-md px-6 py-3 text-slate-200 transition-colors hover:text-cyan-400"
              aria-label="Request a demo"
            >
              <span>Request Demo</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            className="relative mt-16 w-full max-w-4xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-2xl bg-emerald-500/10 blur-lg transition-all duration-300 group-hover:bg-emerald-500/20"></div>
              <div className="relative overflow-hidden rounded-2xl bg-black/30 backdrop-blur-xl shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-cyan-500/10">
                <Image
                  src="/dashboard-mockup.png"
                  alt="MentorHub Dashboard"
                  width={640}
                  height={380}
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
