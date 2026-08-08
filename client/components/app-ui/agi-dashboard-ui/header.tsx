import { ReactNode } from "react"

interface IHeader {
  title: string
  className?: string
  headerEl?: ReactNode
}

export default function Header({ title, headerEl, className }: IHeader) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <div>
        <h1 className={`text-3xl font-bold ${className}`}>{title}</h1>
      </div>
      {headerEl && <div>{headerEl}</div>}
    </header>
  )
}
