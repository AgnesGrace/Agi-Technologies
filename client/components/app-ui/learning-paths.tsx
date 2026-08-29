"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "motion/react"

import { learningPaths } from "@/data/learning-path"

export default function LearningPaths() {
  return (
    <section id="paths" className="bg-background py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
            Choose your path
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            One track. Clear outcomes. Built by people who ship for a living.
          </p>
        </div>

        <ul className="mt-14 divide-y divide-border border-y border-border">
          {learningPaths.map((path, index) => (
            <motion.li
              key={path.link}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: Math.min(index * 0.04, 0.2),
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={path.link}
                className="group flex flex-col gap-3 py-7 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
              >
                <div className="min-w-0 sm:max-w-xl">
                  <h3 className="font-display text-2xl tracking-tight transition-colors group-hover:text-primary">
                    {path.title}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-muted-foreground">
                    {path.description}
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary">
                  View path
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-base font-medium text-primary hover:underline"
          >
            Explore all courses
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
