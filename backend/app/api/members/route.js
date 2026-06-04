import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { memberSchema } from '@/lib/validators'
import { generateQRCode } from '@/lib/qrcode'
import dayjs from 'dayjs'

export async function OPTIONS() { return handleOptions() }

// GET /api/members — list with pagination, search, filter
export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const gender = searchParams.get('gender')
    const skip = (page - 1) * limit

    const where = {}
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { memberCode: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }
    if (isActive !== null && isActive !== '') where.isActive = isActive === 'true'
    if (gender) where.gender = gender

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          memberships: {
            where: { status: 'ACTIVE' },
            include: { plan: { select: { name: true } } },
            orderBy: { endDate: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.member.count({ where }),
    ])

    return successResponse(members, 'Thành công', { page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error(err)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

// POST /api/members — create member
export async function POST(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const body = await request.json()
    const result = memberSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400, result.error.errors)

    // Generate member code
    const count = await prisma.member.count()
    const memberCode = `GYM${String(count + 1).padStart(5, '0')}`

    // Generate QR code
    const qrData = `GYM_MEMBER_${memberCode}`
    const qrCode = await generateQRCode(qrData)

    const member = await prisma.member.create({
      data: {
        ...result.data,
        memberCode,
        qrCode,
        dateOfBirth: result.data.dateOfBirth ? new Date(result.data.dateOfBirth) : null,
      },
    })
    return successResponse(member, 'Tạo hội viên thành công', null, 201)
  } catch (err) {
    console.error(err)
    if (err.code === 'P2002') return errorResponse('Email hoặc mã thành viên đã tồn tại', 'DUPLICATE', 409)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
