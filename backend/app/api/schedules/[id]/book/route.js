import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'

export async function OPTIONS() { return handleOptions() }

// POST /api/schedules/[id]/book — Book a class schedule
export async function POST(request, { params }) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { memberId } = await request.json()
    const scheduleId = parseInt(params.id)
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: { gymClass: true, _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } } },
    })
    if (!schedule) return errorResponse('Không tìm thấy lịch học', 'NOT_FOUND', 404)
    if (schedule._count.bookings >= schedule.gymClass.capacity) return errorResponse('Lớp đã đầy', 'FULL', 400)

    const existing = await prisma.classBooking.findUnique({ where: { scheduleId_memberId: { scheduleId, memberId } } })
    if (existing && existing.status === 'CONFIRMED') return errorResponse('Hội viên đã đặt chỗ', 'ALREADY_BOOKED', 409)

    const booking = await prisma.classBooking.upsert({
      where: { scheduleId_memberId: { scheduleId, memberId } },
      create: { scheduleId, memberId, status: 'CONFIRMED' },
      update: { status: 'CONFIRMED' },
    })
    await prisma.classSchedule.update({ where: { id: scheduleId }, data: { currentCount: { increment: 1 } } })
    return successResponse(booking, 'Đặt chỗ thành công', null, 201)
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}

// DELETE /api/schedules/[id]/book — Cancel booking
export async function DELETE(request, { params }) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const { memberId } = await request.json()
    const scheduleId = parseInt(params.id)
    await prisma.classBooking.update({
      where: { scheduleId_memberId: { scheduleId, memberId } },
      data: { status: 'CANCELLED' },
    })
    await prisma.classSchedule.update({ where: { id: scheduleId }, data: { currentCount: { decrement: 1 } } })
    return successResponse(null, 'Huỷ đặt chỗ thành công')
  } catch (err) {
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
