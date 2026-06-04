import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { hashPassword, comparePassword } from '@/lib/bcrypt'
import { changePasswordSchema } from '@/lib/validators'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const u = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, fullName: true, phone: true, role: true, avatarUrl: true, createdAt: true },
    })
    return successResponse(u)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

export async function POST(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const body = await request.json()
    const result = changePasswordSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400)
    const { currentPassword, newPassword } = result.data
    const u = await prisma.user.findUnique({ where: { id: user.id } })
    const valid = await comparePassword(currentPassword, u.passwordHash)
    if (!valid) return errorResponse('Mật khẩu hiện tại không đúng', 'INVALID_PASSWORD', 400)
    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
    return successResponse(null, 'Đổi mật khẩu thành công')
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
