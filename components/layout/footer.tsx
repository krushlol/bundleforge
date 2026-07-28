import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-8 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} BundleForge. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
