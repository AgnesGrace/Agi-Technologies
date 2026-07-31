import Header from "@/components/app-ui/agi-dashboard-ui/header"
import { UserProfile } from "@clerk/nextjs"

export default function TeacherProfile() {
  return (
    <>
      <Header title="Profile" />
      <UserProfile routing="path" path="/teacher/profile" />
    </>
  )
}
