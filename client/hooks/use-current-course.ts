import { useGetCourseQuery } from "@/state/api"
import { useSearchParams } from "next/navigation"

export default function useCurrentCourse() {
  const searchParams = useSearchParams()
  const slug = searchParams.get("slug") ?? ""

  const { data: course, ...items } = useGetCourseQuery(slug, { skip: !slug })

  return { course, slug, ...items }
}
