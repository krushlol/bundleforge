export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.platformConnection.deleteMany({
    where: { id, userId: user.id },
  })

  return NextResponse.redirect(new URL('/account', req.url), 303)
}
