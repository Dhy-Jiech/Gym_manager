import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { classSchema } from '@/lib/validators'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const classes = await prisma.gymClass.findMany({
      include: { trainer: { include: { user: { select: { fullName: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
    return successResponse(classes)
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
    const result = classSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400)
    const gymClass = await prisma.gymClass.create({
      data: result.data,
      include: { trainer: { include: { user: { select: { fullName: true } } } } },
    })
    return successResponse(gymClass, 'Tạo lớp thành công', null, 201)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
