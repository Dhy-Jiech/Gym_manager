import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { paymentSchema } from '@/lib/validators'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const method = searchParams.get('method')
    const paymentStatus = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const skip = (page - 1) * limit
    const where = {}
    if (method) where.method = method
    if (paymentStatus) where.status = paymentStatus
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where, skip, take: limit,
        include: { member: { select: { fullName: true, memberCode: true } }, membership: { include: { plan: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ])
    return successResponse(payments, 'Thành công', { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

export async function POST(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const body = await request.json()
    const result = paymentSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400)
    const data = { ...result.data }
    if (data.paidAt) data.paidAt = new Date(data.paidAt)
    const payment = await prisma.payment.create({
      data,
      include: { member: { select: { fullName: true, memberCode: true } } },
    })
    return successResponse(payment, 'Ghi nhận thanh toán thành công', null, 201)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
