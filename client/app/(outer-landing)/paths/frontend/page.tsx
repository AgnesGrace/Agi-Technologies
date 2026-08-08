import { Button } from "@/components/ui/button"
import { EmptyCourseComponent } from "@/components/ui/empty"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FrontendPath() {
  return (
    <EmptyCourseComponent description="Coming Soon" title="Frontend">
      <p>We are currently working on this path, please check back later.</p>
      <Link href="/">
        <Button className="w-fit" size="lg">
          <ArrowLeft />
          Back
        </Button>
      </Link>
    </EmptyCourseComponent>
  )
}
