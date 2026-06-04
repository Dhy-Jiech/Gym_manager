import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'

export async function OPTIONS() { return handleOptions() }

// POST /api/checkin/qr — check-in by QR code
export async function POST(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { qrCode } = await request.json()
    if (!qrCode) return errorResponse('QR code bắt buộc', 'MISSING_QR', 400)

    const member = await prisma.member.findFirst({ where: { qrCode, isActive: true } })
    if (!member) return errorResponse('QR code không hợp lệ hoặc hội viên không tồn tại', 'INVALID_QR', 404)

    // Check active membership
    const now = new Date()
    const activeMembership = await prisma.membership.findFirst({
      where: { memberId: member.id, status: 'ACTIVE', startDate: { lte: now }, endDate: { gte: now } },
      include: { plan: true },
    })

    // Check already checked in today
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const existingCheckin = await prisma.checkIn.findFirst({
      where: { memberId: member.id, checkinAt: { gte: todayStart }, checkoutAt: null },
    })

    let checkIn
    if (existingCheckin) {
      // Check out
      checkIn = await prisma.checkIn.update({
        where: { id: existingCheckin.id },
        data: { checkoutAt: now },
      })
    } else {
      // Check in
      checkIn = await prisma.checkIn.create({
        data: { memberId: member.id, method: 'QR' },
      })
    }

    return successResponse({
      checkIn,
      member: { id: member.id, fullName: member.fullName, memberCode: member.memberCode, avatarUrl: member.avatarUrl },
      activeMembership,
      action: existingCheckin ? 'checkout' : 'checkin',
    }, existingCheckin ? 'Check-out thành công' : 'Check-in thành công')
  } catch (err) {
    console.error(err)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
