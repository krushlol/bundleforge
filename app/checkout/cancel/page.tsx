import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CheckoutCancelPage() {
  return (
    <div className="container py-24 text-center space-y-4 max-w-md">
      <div className="text-5xl">↩️</div>
      <h1 className="text-2xl font-bold">Payment cancelled</h1>
      <p className="text-muted-foreground">No charge was made. You can go back and try again whenever you&apos;re ready.</p>
      <div className="flex gap-3 justify-center">
        <Button asChild variant="outline">
          <Link href="/bundles">Browse Bundles</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
