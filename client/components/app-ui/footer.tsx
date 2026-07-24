export default function Footer() {
  return (
    <footer className="border-t border-neutral-200/20 bg-white/70 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-black/60">
      <div className="flex h-16 w-full items-center justify-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          &copy; {new Date().getFullYear()} Agi Technologies. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}
