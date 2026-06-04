import prisma from '@/lib/prisma'
import { comparePassword, hashPassword } from '@/lib/bcrypt'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/jwt'
import { errorResponse, successResponse, getAuthUser, handleOptions } from '@/lib/auth'
import { loginSchema, changePasswordSchema } from '@/lib/validators'

export async function OPTIONS() { return handleOptions() }

// POST /api/auth/login
export async function POST(request) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400, result.error.errors)
    }
    const { email, password } = result.data
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      return errorResponse('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS', 401)
    }
    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) {
      return errorResponse('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS', 401)
    }
    const payload = { id: user.id, email: user.email, role: user.role, fullName: user.fullName }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken({ id: user.id })
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })
    return successResponse({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, avatarUrl: user.avatarUrl },
    }, 'Đăng nhập thành công')
  } catch (err) {
    console.error(err)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
