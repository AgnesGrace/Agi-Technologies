export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background" id="footer">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6 sm:px-8">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AgiTech. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
