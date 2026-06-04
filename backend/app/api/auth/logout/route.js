import prisma from '@/lib/prisma'
import { errorResponse, successResponse, handleOptions } from '@/lib/auth'

export async function OPTIONS() { return handleOptions() }

export async function POST(request) {
  try {
    const { refreshToken } = await request.json()
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    return successResponse(null, 'Đăng xuất thành công')
  } catch (err) {
    console.error(err)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
