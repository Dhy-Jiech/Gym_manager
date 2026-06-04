import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'

export async function OPTIONS() { return handleOptions() }

// GET /api/members/expiring?days=30
export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const now = new Date()
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    const memberships = await prisma.membership.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { gte: now, lte: future },
      },
      include: { member: true, plan: { select: { name: true } } },
      orderBy: { endDate: 'asc' },
    })
    return successResponse(memberships)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
