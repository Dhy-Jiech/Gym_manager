import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { memberSchema } from '@/lib/validators'
import { generateQRCode } from '@/lib/qrcode'

export async function OPTIONS() { return handleOptions() }

// GET /api/members/[id]
export async function GET(request, { params }) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        memberships: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
        checkIns: { orderBy: { checkinAt: 'desc' }, take: 10 },
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
        ptSessions: { include: { trainer: { include: { user: { select: { fullName: true } } } } }, orderBy: { scheduledAt: 'desc' }, take: 5 },
        classBookings: { include: { schedule: { include: { gymClass: true } } }, orderBy: { bookedAt: 'desc' }, take: 5 },
      },
    })
    if (!member) return errorResponse('Không tìm thấy hội viên', 'NOT_FOUND', 404)
    return successResponse(member)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

// PUT /api/members/[id]
export async function PUT(request, { params }) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const body = await request.json()
    const result = memberSchema.partial().safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400, result.error.errors)
    const data = { ...result.data }
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth)
    const member = await prisma.member.update({ where: { id: parseInt(params.id) }, data })
    return successResponse(member, 'Cập nhật thành công')
  } catch (err) {
    if (err.code === 'P2025') return errorResponse('Không tìm thấy hội viên', 'NOT_FOUND', 404)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

// DELETE /api/members/[id]
export async function DELETE(request, { params }) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    await prisma.member.update({ where: { id: parseInt(params.id) }, data: { isActive: false } })
    return successResponse(null, 'Xoá hội viên thành công')
  } catch (err) {
    if (err.code === 'P2025') return errorResponse('Không tìm thấy hội viên', 'NOT_FOUND', 404)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
