import { ReactNode } from "react"

interface IHeader {
  title: string

  headerEl?: ReactNode
}

export default function Header({ title, headerEl }: IHeader) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      {headerEl && <div>{headerEl}</div>}
    </header>
  )
}
