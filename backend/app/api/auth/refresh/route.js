import prisma from '@/lib/prisma'
import { verifyRefreshToken, signAccessToken } from '@/lib/jwt'
import { errorResponse, successResponse, handleOptions } from '@/lib/auth'

export async function OPTIONS() { return handleOptions() }

export async function POST(request) {
  try {
    const { refreshToken } = await request.json()
    if (!refreshToken) return errorResponse('Refresh token bắt buộc', 'MISSING_TOKEN', 400)

    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      return errorResponse('Refresh token không hợp lệ', 'INVALID_TOKEN', 401)
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken }, include: { user: true } })
    if (!stored || stored.expiresAt < new Date()) {
      return errorResponse('Refresh token hết hạn', 'TOKEN_EXPIRED', 401)
    }

    const { user } = stored
    const tokenPayload = { id: user.id, email: user.email, role: user.role, fullName: user.fullName }
    const accessToken = signAccessToken(tokenPayload)

    return successResponse({ accessToken }, 'Token đã được làm mới')
  } catch (err) {
    console.error(err)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
