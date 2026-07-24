"use client"

import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export default function CourseListSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mb-12">
        <Skeleton className="h-8 w-36 rounded-full" />

        <Skeleton className="mt-6 h-12 max-w-2xl" />

        <Skeleton className="mt-3 h-6 max-w-xl" />
        <Skeleton className="mt-2 h-6 max-w-lg" />
      </div>

      <div className="mb-12 flex flex-wrap gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-28 rounded-full" />
        ))}
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          >
            <Skeleton className="aspect-video w-full" />

            <div className="space-y-3 p-3">
              <Skeleton className="h-5 w-4/5" />

              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />

              <div className="pt-2">
                <Skeleton className="h-3 w-1/2" />

                <div className="mt-3 flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
