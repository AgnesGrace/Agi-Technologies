import { useFormContext } from "react-hook-form"
import { FormField, FormControl } from "@/components/app-ui/form"
import { Switch } from "../ui/switch"
import { Label } from "@radix-ui/react-label"

interface SettingsSwitchProps {
  name: string
  label: string
}

export default function SettingsSwitch({ name, label }: SettingsSwitchProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center gap-4">
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>

          <Label>{label}</Label>
        </div>
      )}
    />
  )
}
