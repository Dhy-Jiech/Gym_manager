import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { userSchema } from '@/lib/validators'
import { hashPassword } from '@/lib/bcrypt'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) return errorResponse('Không có quyền', 'FORBIDDEN', 403)
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true, phone: true, role: true, isActive: true, createdAt: true, avatarUrl: true },
      orderBy: { createdAt: 'desc' },
    })
    return successResponse(users)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

export async function POST(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) return errorResponse('Không có quyền', 'FORBIDDEN', 403)
  try {
    const body = await request.json()
    const result = userSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400)
    const passwordHash = await hashPassword(result.data.password || 'GymPro@123')
    const newUser = await prisma.user.create({
      data: {
        email: result.data.email,
        fullName: result.data.fullName,
        phone: result.data.phone,
        role: result.data.role || 'STAFF',
        passwordHash,
      },
      select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
    })
    return successResponse(newUser, 'Tạo tài khoản thành công', null, 201)
  } catch (err) {
    if (err.code === 'P2002') return errorResponse('Email đã tồn tại', 'DUPLICATE', 409)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
