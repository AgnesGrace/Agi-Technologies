import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const STAGES = [
  { id: 1, label: "Details" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Complete" },
]

interface WizardStepperProps {
  currentStage: number
}

export default function WizardStepper({ currentStage }: WizardStepperProps) {
  console.log(currentStage, "stage")
  return (
    <nav aria-label="Progress" className="w-full p-8">
      <ul className="flex items-start">
        {STAGES.map((stage, index) => {
          console.log(stage, "stage")
          const completed = currentStage > stage.id
          const active = currentStage === stage.id
          const lastCompleted =
            stage.id === STAGES.length && currentStage === STAGES.length

          const isDone = completed || lastCompleted

          return (
            <li
              key={stage.id}
              className={cn(
                "relative flex flex-1 items-start",
                index === STAGES.length - 1 && "flex-none"
              )}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300",
                    {
                      "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30":
                        isDone,

                      "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30":
                        active,

                      "border-border bg-background text-muted-foreground":
                        !active && !isDone,
                    }
                  )}
                >
                  {isDone ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{stage.id}</span>
                  )}
                </div>

                <span
                  className={cn("mt-3 text-sm font-medium transition-colors", {
                    "text-foreground": active || isDone,
                    "text-muted-foreground": !active && !isDone,
                  })}
                >
                  {stage.label}
                </span>
              </div>

              {index < STAGES.length - 1 && (
                <div className="relative mx-4 mt-5 h-[2px] flex-1 rounded-full bg-muted">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-500",
                      completed ? "w-full" : "w-0"
                    )}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
