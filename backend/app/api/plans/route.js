import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { planSchema } from '@/lib/validators'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const where = {}
    if (isActive !== null && isActive !== '') where.isActive = isActive === 'true'
    const plans = await prisma.membershipPlan.findMany({ where, orderBy: { price: 'asc' } })
    return successResponse(plans)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

export async function POST(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) return errorResponse('Không có quyền', 'FORBIDDEN', 403)
  try {
    const body = await request.json()
    const result = planSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400, result.error.errors)
    const plan = await prisma.membershipPlan.create({ data: result.data })
    return successResponse(plan, 'Tạo gói tập thành công', null, 201)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
