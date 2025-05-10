import Link from "next/link"
import { Grid, Github, Twitter, MessageSquare } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-800 py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-emerald-400">
                <Grid className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-slate-50">MentorHub</span>
            </Link>

            <p className="mt-4 max-w-md text-slate-400">
              Modern mentorship platform for coding education. Create assignments, share resources, and review code in
              one unified hub.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Platform</h3>
              <ul className="mt-4 space-y-2">
                {["Features", "Pricing", "About"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`#${item.toLowerCase()}`}
                      className="text-slate-300 transition-colors hover:text-emerald-400"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Legal</h3>
              <ul className="mt-4 space-y-2">
                {["Privacy", "Terms", "Cookie Policy"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(" ", "-")}`}
                      className="text-slate-300 transition-colors hover:text-emerald-400"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Connect</h3>
              <ul className="mt-4 flex space-x-4">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-emerald-400"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-emerald-400"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-emerald-400"
                    aria-label="Discord"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center">
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} MentorHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
