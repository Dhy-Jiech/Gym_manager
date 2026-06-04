import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { trainerSchema } from '@/lib/validators'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const trainers = await prisma.trainer.findMany({
      include: { user: { select: { fullName: true, email: true, phone: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return successResponse(trainers)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

export async function POST(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) return errorResponse('Không có quyền', 'FORBIDDEN', 403)
  try {
    const body = await request.json()
    const result = trainerSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400)
    const trainer = await prisma.trainer.create({
      data: result.data,
      include: { user: { select: { fullName: true, email: true } } },
    })
    return successResponse(trainer, 'Thêm HLV thành công', null, 201)
  } catch (err) {
    if (err.code === 'P2002') return errorResponse('User đã là HLV', 'DUPLICATE', 409)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
