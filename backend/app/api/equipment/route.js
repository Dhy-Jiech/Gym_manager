import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import { equipmentSchema } from '@/lib/validators'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { searchParams } = new URL(request.url)
    const eqStatus = searchParams.get('status')
    const where = {}
    if (eqStatus) where.status = eqStatus
    const equipment = await prisma.equipment.findMany({
      where, 
      include: { maintenanceLogs: { orderBy: { maintainedAt: 'desc' }, take: 3 } },
      orderBy: { createdAt: 'desc' }
    })
    return successResponse(equipment)
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
    const result = equipmentSchema.safeParse(body)
    if (!result.success) return errorResponse('Dữ liệu không hợp lệ', 'VALIDATION_ERROR', 400)
    const data = { ...result.data }
    if (data.purchaseDate) data.purchaseDate = new Date(data.purchaseDate)
    const equipment = await prisma.equipment.create({ data })
    return successResponse(equipment, 'Thêm thiết bị thành công', null, 201)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
