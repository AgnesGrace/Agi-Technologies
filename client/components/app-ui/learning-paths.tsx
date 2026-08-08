"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { HoverEffect } from "@/components/ui/card-hover-effect"
import { learningPaths } from "@/data/learning-path"

export default function LearningPaths() {
  return (
    <section className="py-28">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="rounded-full border px-4 py-2 text-sm font-medium">
            Career Paths
          </span>

          <h2 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Choose Your Career Path
          </h2>

          <p className="mt-6 text-lg text-muted-foreground">
            Follow structured learning roadmaps designed by industry
            professionals. Build real-world projects, master modern tools, and
            become job-ready.
          </p>
        </div>

        <HoverEffect
          items={learningPaths.map((path) => ({
            title: path.title,
            description: (
              <div className="space-y-6">
                <path.icon className="h-10 w-10 text-primary" />

                <p className="text-sm leading-7 text-gray-400">
                  {path.description}
                </p>

                <div className="grid grid-cols-3 gap-4 rounded-lg border p-4 text-center">
                  <div>
                    <p className="text-xl font-bold">{path.courses}</p>
                    <span className="text-xs text-muted-foreground">
                      Courses
                    </span>
                  </div>

                  <div>
                    <p className="text-xl font-bold">{path.projects}</p>
                    <span className="text-xs text-muted-foreground">
                      Projects
                    </span>
                  </div>

                  <div>
                    <p className="text-lg font-bold">{path.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-medium text-primary">
                  View Path
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ),
            link: path.link,
          }))}
        />

        <div className="mt-14 text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:underline dark:text-blue-400"
          >
            Explore
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
