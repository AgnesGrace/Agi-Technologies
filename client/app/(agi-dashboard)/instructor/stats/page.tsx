import Header from "@/components/app-ui/agi-dashboard-ui/header"
import { EmptyCourseComponent } from "@/components/ui/empty"

export default function InstructorStatsPage() {
  return (
    <>
      <Header title="Stats" />
      <EmptyCourseComponent description="Coming Soon" title="Stats">
        <p>We are currently working on your stats, please check back later.</p>
      </EmptyCourseComponent>
    </>
  )
}
