import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

const CourseListSkeleton = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-4 text-center"
    >
      <div className="mx-auto mt-10 py-12">
        {/* Description */}
        <div className="mx-auto mb-8 max-w-2xl space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="mx-auto h-5 w-4/5" />
        </div>

        {/* Category Buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-28 rounded-lg" />
          ))}
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border">
              <Skeleton className="h-48 w-full" />

              <div className="space-y-4 p-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />

                <div className="flex items-center justify-between pt-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default CourseListSkeleton
