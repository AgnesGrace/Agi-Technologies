import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative flex h-140 w-full items-center justify-center overflow-hidden bg-white dark:bg-black">
      <div
        className={cn(
          "absolute inset-0",
          "bg-size-[300px_150px]",
          "bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      <div className="relative z-20 flex flex-col gap-4 bg-linear-to-b from-neutral-200 to-neutral-500 bg-clip-text">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="tracking-widest uppercase">Agi Technologies</h1>
          <p className="text-2xl md:text-4xl">Get access to all Technologies</p>
          <p>Best home to learn and get a Job in Tech</p>
          <p>Pick a path and start today!</p>
          <Link href="/courses">
            <Button className="cursor-pointer text-xl" size="lg">
              Explore
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
