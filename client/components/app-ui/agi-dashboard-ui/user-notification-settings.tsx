"use client"
import { useUpdateUserInfoMutation } from "@/state/api"
import { useUser } from "@clerk/nextjs"
import { LoggedInUserSettings } from "@/state/api.types"
import { userNotificationFrequency } from "@/data/user"

import {
  UserNotificationSettingsFormData,
  userNotificationsSchema,
} from "@/lib/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField } from "../form"
import SettingsSwitch from "../settings-switch"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface IUsernotificationSettings {
  title?: string
}

export default function UsernotificationSettings({
  title = "Manage Your Notifications",
}: IUsernotificationSettings) {
  const { user } = useUser()
  const [updateUserInfo] = useUpdateUserInfoMutation()

  const currentUserSettings =
    (user?.publicMetadata as { settings?: LoggedInUserSettings })?.settings ||
    {}

  const notificationsMethod = useForm<UserNotificationSettingsFormData>({
    resolver: zodResolver(userNotificationsSchema),
    defaultValues: {
      phoneCalls: currentUserSettings.phoneCalls || false,
      emailAlerts: currentUserSettings.emailAlerts || false,
      smsAlerts: currentUserSettings.smsAlerts || false,
      courseNotifications: currentUserSettings.courseNotifications || false,
      notificationFrequency:
        currentUserSettings.notificationFrequency || "weekly",
    },
  })

  const onSubmit = async (
    updatedSettings: UserNotificationSettingsFormData
  ) => {
    if (!user) return

    const updatedUser = {
      userId: user.id,
      publicMetadata: {
        ...user.publicMetadata,
        settings: {
          ...currentUserSettings,
          ...updatedSettings,
        },
      },
    }

    try {
      await updateUserInfo(updatedUser)
    } catch (error) {
      console.error("Something went wrong while updating user settings", error)
    }
  }

  if (!user)
    return <p> You must sign in before you can perform this operation</p>
  return (
    <div>
      <Form {...notificationsMethod}>
        <form
          onSubmit={notificationsMethod.handleSubmit(onSubmit)}
          className="flex flex-col gap-8"
        >
          <SettingsSwitch name="phoneCalls" label="Phone Calls" />

          <SettingsSwitch name="smsAlerts" label="SMS Alerts" />

          <SettingsSwitch name="emailAlerts" label="Email Alerts" />

          <SettingsSwitch
            name="courseNotifications"
            label="Course Notifications"
          />
          <FieldGroup>
            <Field>
              <FieldContent>
                <FieldLabel>Notifications Frequency</FieldLabel>
                <FieldDescription className="text-gray-400">
                  Select your alerts/notifications frequencies, you can change
                  this any time.
                </FieldDescription>
              </FieldContent>
            </Field>
            <FormField
              control={notificationsMethod.control}
              name="notificationFrequency"
              render={({ field }) => (
                <Field className="w-3/5">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectGroup>
                        {userNotificationFrequency.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <div className="flex justify-end">
              <Button size="lg" type="submit">
                {notificationsMethod.formState?.isSubmitting
                  ? "Updating..."
                  : "Update"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </Form>
    </div>
  )
}
