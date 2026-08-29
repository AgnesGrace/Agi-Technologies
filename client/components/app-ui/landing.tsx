"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import LearningPaths from "./learning-paths"
import { cn } from "@/lib/utils"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2400&q=80"

const howItWorks = [
  {
    step: "01",
    title: "Pick a path",
    body: "Choose the engineering track that matches the job you want.",
  },
  {
    step: "02",
    title: "Build in public",
    body: "Ship real projects with courses sequenced for depth, not noise.",
  },
  {
    step: "03",
    title: "Get hired ready",
    body: "Leave with portfolio work, interview fluency, and hire-ready skills.",
  },
]

export default function Landing() {
  return (
    <div className="bg-(--landing-mist) text-(--landing-ink) dark:bg-background dark:text-foreground">
      <section className="relative min-h-svh overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.06, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={HERO_IMAGE}
            alt="Engineers collaborating on product work"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_30%]"
          />
        </motion.div>

        <div className="absolute inset-0 bg-linear-to-r from-[oklch(0.16_0.03_250/0.88)] via-[oklch(0.18_0.03_250/0.72)] to-[oklch(0.22_0.04_230/0.35)]" />
        <div className="absolute inset-0 bg-linear-to-t from-[oklch(0.14_0.03_250/0.55)] via-transparent to-[oklch(0.2_0.02_250/0.25)]" />

        <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col justify-end px-6 pt-28 pb-20 sm:px-8 sm:pb-24 lg:justify-center lg:pb-28">
          <div className="max-w-3xl text-white">
            <motion.p
              className="font-display text-4xl tracking-tight sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              AgiTech
            </motion.p>

            <motion.h1
              className="mt-5 max-w-2xl font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Ship the career you study for.
            </motion.h1>

            <motion.p
              className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.16,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Structured paths, real projects, and hire-ready skills—built for
              people who want to work in tech, not just watch it.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href="/courses"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 gap-1 px-7 text-base"
                )}
              >
                Start learning
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="#paths"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 border-white/35 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
                )}
              >
                Browse paths
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <LearningPaths />

      <section className="border-t border-border/60 bg-background py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three moves. No fluff between you and shipping.
            </p>
          </div>

          <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            {howItWorks.map((item, index) => (
              <motion.li
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <p className="font-display text-sm tracking-[0.2em] text-primary uppercase">
                  {item.step}
                </p>
                <h3 className="mt-3 font-display text-2xl tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-sm text-base leading-7 text-muted-foreground">
                  {item.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border/60 bg-[oklch(0.2_0.04_250)] py-24 text-white sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.45_0.1_230/0.35),transparent_55%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Ready when you are.
            </h2>
            <p className="mt-4 text-lg text-white/75">
              Open the catalog and take the first course on your path.
            </p>
          </div>

          <Link
            href="/courses"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-1 bg-white px-7 text-base text-[oklch(0.18_0.03_250)] hover:bg-white/90"
            )}
          >
            Browse courses
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
