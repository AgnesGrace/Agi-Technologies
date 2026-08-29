import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface BrandMarkProps {
  className?: string
  showWordmark?: boolean
  href?: string
}

export function BrandMark({
  className,
  showWordmark = true,
  href = "/",
}: BrandMarkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-foreground",
        className
      )}
    >
      <Image
        src="/brand/agitech-mark.png"
        alt=""
        width={28}
        height={28}
        className="size-7 rounded-md"
        priority
      />
      {showWordmark ? (
        <span>AgiTech</span>
      ) : (
        <span className="sr-only">AgiTech home</span>
      )}
    </Link>
  )
}
