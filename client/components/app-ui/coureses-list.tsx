import { motion } from "framer-motion"
import { COURSE_CATEGORIES } from "@/data/courses"

export default function CoursesList() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-4 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto mt-10 py-12"
      >
        <p className="mb-6 text-lg text-gray-500">
          Explore our wide range of courses and enhance your skills. Start
          learning today and advance your career.
        </p>
        <div className="mb-8 flex flex-wrap justify-center gap-8">
          {COURSE_CATEGORIES.map((category) => (
            <button
              key={category}
              className="rounded-lg bg-gray-200 px-4 py-2 text-lg font-medium text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {category}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"></div>
      </motion.div>
    </motion.section>
  )
}
