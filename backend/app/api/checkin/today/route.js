import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999)
    const checkIns = await prisma.checkIn.findMany({
      where: { checkinAt: { gte: todayStart, lte: todayEnd } },
      include: { member: { select: { fullName: true, memberCode: true, avatarUrl: true } } },
      orderBy: { checkinAt: 'desc' },
    })
    return successResponse({ checkIns, total: checkIns.length })
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
