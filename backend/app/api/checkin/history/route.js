import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const memberId = searchParams.get('memberId')
    const skip = (page - 1) * limit

    const where = {}
    if (from || to) {
      where.checkinAt = {}
      if (from) where.checkinAt.gte = new Date(from)
      if (to) where.checkinAt.lte = new Date(to)
    }
    if (memberId) where.memberId = parseInt(memberId)

    const [checkIns, total] = await Promise.all([
      prisma.checkIn.findMany({
        where, skip, take: limit,
        include: { member: { select: { fullName: true, memberCode: true } } },
        orderBy: { checkinAt: 'desc' },
      }),
      prisma.checkIn.count({ where }),
    ])
    return successResponse(checkIns, 'Thành công', { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
