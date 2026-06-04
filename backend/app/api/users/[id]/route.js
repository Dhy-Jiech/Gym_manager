import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { hashPassword } from '@/lib/bcrypt'

export async function OPTIONS() { return handleOptions() }

// PUT /api/users/[id]
export async function PUT(request, { params }) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) return errorResponse('Không có quyền', 'FORBIDDEN', 403)
  try {
    const body = await request.json()
    const data = {}
    if (body.fullName !== undefined) data.fullName = body.fullName
    if (body.phone !== undefined) data.phone = body.phone
    if (body.role !== undefined) data.role = body.role
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.password) data.passwordHash = await hashPassword(body.password)

    const updated = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data,
      select: { id: true, email: true, fullName: true, phone: true, role: true, isActive: true },
    })
    return successResponse(updated, 'Cập nhật thành công')
  } catch (err) {
    if (err.code === 'P2025') return errorResponse('Không tìm thấy user', 'NOT_FOUND', 404)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
