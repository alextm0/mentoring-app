"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Grid } from "lucide-react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/30 backdrop-blur-xl shadow-sm" : ""
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-400">
                <Grid className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-slate-50">MentorHub</span>
            </Link>
          </div>

          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {["Features", "Pricing", "About"].map((item) => (
                <li key={item}>
                  <Link
                    href={`#${item.toLowerCase()}`}
                    className="group relative text-slate-200 transition-colors hover:text-emerald-400"
                  >
                    {item}
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 w-0 bg-emerald-400"
                      initial={{ width: "0%" }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-slate-200 transition-all hover:text-emerald-400"
              aria-label="Log in to your account"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="group relative overflow-hidden rounded-md bg-gradient-to-tr from-emerald-400 to-emerald-500 px-4 py-2 text-black shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Sign up for an account"
            >
              <span className="relative z-10">Sign Up</span>
              <span className="absolute inset-0 z-0 bg-gradient-to-tr from-emerald-400 to-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
