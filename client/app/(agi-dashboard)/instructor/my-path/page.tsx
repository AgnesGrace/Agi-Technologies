import Header from "@/components/app-ui/agi-dashboard-ui/header"
import { EmptyCourseComponent } from "@/components/ui/empty"

export default function CarrerPath() {
  return (
    <>
      <Header title="Career Path" />
      <EmptyCourseComponent description="Coming Soon" title="My Career Path">
        <p>We are currently working on your path, please check back later.</p>
      </EmptyCourseComponent>
    </>
  )
}
