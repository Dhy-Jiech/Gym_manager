import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { ptSessionSchema } from '@/lib/validators'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const trainerId = searchParams.get('trainerId')
    const memberId = searchParams.get('memberId')
    const ptStatus = searchParams.get('status')
    const skip = (page - 1) * limit
    const where = {}
    if (trainerId) where.trainerId = parseInt(trainerId)
    if (memberId) where.memberId = parseInt(memberId)
    if (ptStatus) where.status = ptStatus

    const [sessions, total] = await Promise.all([
      prisma.ptSession.findMany({
        where, skip, take: limit,
        include: {
          member: { select: { fullName: true, memberCode: true } },
          trainer: { include: { user: { select: { fullName: true } } } },
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      prisma.ptSession.count({ where }),
    ])
    return successResponse(sessions, 'Thành công', { page, limit, total })
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

export async function POST(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const body = await request.json()
    const result = ptSessionSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400)
    const session = await prisma.ptSession.create({
      data: { ...result.data, scheduledAt: new Date(result.data.scheduledAt) },
      include: {
        member: { select: { fullName: true } },
        trainer: { include: { user: { select: { fullName: true } } } },
      },
    })
    return successResponse(session, 'Đặt buổi PT thành công', null, 201)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
