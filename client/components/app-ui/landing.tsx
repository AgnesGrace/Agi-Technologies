"use client"

import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import LearningPaths from "./learning-paths"

export default function Landing() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-black">
      <div
        className={cn(
          "absolute inset-0",
          "bg-size-[100px_100px]",
          "bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />

      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center p-6 text-center">
        <div className="mb-8 rounded-full border border-neutral-200 bg-white/70 px-5 py-2 text-sm font-medium backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
          Empowering Developers Worldwide
        </div>

        <h1 className="max-w-6xl bg-gradient-to-b from-neutral-900 to-neutral-600 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl dark:from-neutral-100 dark:to-neutral-500">
          Learn Tech
          <br />
          Build Real Projects
          <br />
          <span className="bg-linear-to-r from-[oklch(0.4_0.134_242.749)] via-[oklch(0.7_0.16_242.749)] to-[oklch(0.5_0.134_242.749)] bg-clip-text text-transparent drop-shadow-[0_0_18px_oklch(0.5_0.134_242.749/.35)]">
            Get Hired Worldwide.
          </span>{" "}
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-neutral-600 md:text-xl dark:text-neutral-400">
          Master modern technologies through structured learning paths, hands-on
          projects, mentorship, assessments, and interview preparation designed
          to launch your career in tech.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="h-12 px-8 text-base">
            <Link href="/courses">Start Learning</Link>
          </Button>

          <Button size="lg" variant="outline" className="h-12 px-8 text-base">
            <Play className="mr-2 h-4 w-4" />
            Watch Demo
          </Button>
        </div>

        <div className="mt-20 grid w-full max-w-4xl grid-cols-2 gap-10 md:grid-cols-4">
          <div>
            <h3 className="text-3xl font-bold">5K+</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Students
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-bold">50+</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Projects
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-bold">50+</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Courses
            </p>
          </div>

          <div>
            <h3 className="text-3xl font-bold">4.9★</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Student Rating
            </p>
          </div>
        </div>

        <div className="mt-24 w-full" id="paths">
          <LearningPaths />
        </div>
      </div>
    </section>
  )
}
