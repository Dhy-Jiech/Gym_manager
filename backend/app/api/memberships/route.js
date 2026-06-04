import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { membershipSchema } from '@/lib/validators'
import dayjs from 'dayjs'

export async function OPTIONS() { return handleOptions() }

export async function POST(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) return errorResponse('Không có quyền', 'FORBIDDEN', 403)
  try {
    const body = await request.json()
    const result = membershipSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400, result.error.errors)
    const plan = await prisma.membershipPlan.findUnique({ where: { id: result.data.planId } })
    if (!plan) return errorResponse('Không tìm thấy gói tập', 'NOT_FOUND', 404)
    const startDate = dayjs(result.data.startDate)
    const endDate = startDate.add(plan.durationDays, 'day')
    const membership = await prisma.membership.create({
      data: {
        memberId: result.data.memberId,
        planId: result.data.planId,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        price: plan.price,
        note: result.data.note,
        status: 'ACTIVE',
      },
      include: { plan: true, member: { select: { fullName: true, memberCode: true } } },
    })
    return successResponse(membership, 'Đăng ký gói thành công', null, 201)
  } catch (err) {
    console.error(err)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
