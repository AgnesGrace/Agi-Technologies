import { z } from "zod"

export const userNotificationsSchema = z.object({
  phoneCalls: z.boolean(),
  smsAlerts: z.boolean(),
  emailAlerts: z.boolean(),
  courseNotifications: z.boolean(),

  notificationFrequency: z.enum(["immediate", "daily", "weekly", "monthly"]),
})

export type UserNotificationSettingsFormData = z.infer<
  typeof userNotificationsSchema
>
