import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { generateQRCode } from '@/lib/qrcode'

export async function OPTIONS() { return handleOptions() }

export async function GET(request, { params }) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const member = await prisma.member.findUnique({ where: { id: parseInt(params.id) }, select: { memberCode: true, qrCode: true, fullName: true } })
    if (!member) return errorResponse('Không tìm thấy hội viên', 'NOT_FOUND', 404)
    if (!member.qrCode) {
      const qrCode = await generateQRCode(`GYM_MEMBER_${member.memberCode}`)
      await prisma.member.update({ where: { id: parseInt(params.id) }, data: { qrCode } })
      member.qrCode = qrCode
    }
    return successResponse({ qrCode: member.qrCode, memberCode: member.memberCode, fullName: member.fullName })
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
