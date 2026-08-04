import Header from "@/components/app-ui/agi-dashboard-ui/header"
import UsernotificationSettings from "@/components/app-ui/agi-dashboard-ui/user-notification-settings"

export default function Settings() {
  return (
    <div
      className="relative min-h-full bg-cover bg-center"
      style={{ backgroundImage: "url('/images/settings.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/85" />
      <div className="relative z-10 p-8 text-white">
        <Header title="Settings" className="text-white" />
        <UsernotificationSettings />
      </div>
    </div>
  )
}
