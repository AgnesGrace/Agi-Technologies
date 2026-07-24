"use client"

import Hero from "@/components/app-ui/hero"
import { useGetCoursesQuery } from "@/state/api"

export default function Page() {
  const { data: courses, isLoading, isError } = useGetCoursesQuery({})
  console.log(courses)
  return (
    <main>
      <Hero />
    </main>
  )
}
