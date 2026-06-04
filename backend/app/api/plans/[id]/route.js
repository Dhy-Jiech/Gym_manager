import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { planSchema } from '@/lib/validators'

export async function OPTIONS() { return handleOptions() }

export async function PUT(request, { params }) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) return errorResponse('Không có quyền', 'FORBIDDEN', 403)
  try {
    const body = await request.json()
    const result = planSchema.partial().safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400)
    const plan = await prisma.membershipPlan.update({ where: { id: parseInt(params.id) }, data: result.data })
    return successResponse(plan, 'Cập nhật gói tập thành công')
  } catch (err) {
    if (err.code === 'P2025') return errorResponse('Không tìm thấy gói tập', 'NOT_FOUND', 404)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

export async function DELETE(request, { params }) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) return errorResponse('Không có quyền', 'FORBIDDEN', 403)
  try {
    await prisma.membershipPlan.update({ where: { id: parseInt(params.id) }, data: { isActive: false } })
    return successResponse(null, 'Xoá gói tập thành công')
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
