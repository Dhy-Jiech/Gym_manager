import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, handleOptions } from '@/lib/auth'
import dayjs from 'dayjs'

export async function OPTIONS() { return handleOptions() }

export async function GET(request) {
  const { user, error, status } = await getAuthUser(request)
  if (error) return errorResponse(error, 'UNAUTHORIZED', status)
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999)

    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      todayCheckIns,
      monthRevenue,
      expiringIn7Days,
      recentCheckIns,
      todayClasses,
      maintenanceDue,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { isActive: true } }),
      prisma.member.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.checkIn.count({ where: { checkinAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      prisma.membership.count({
        where: {
          status: 'ACTIVE',
          endDate: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.checkIn.findMany({
        where: { checkinAt: { gte: todayStart } },
        include: { member: { select: { fullName: true, memberCode: true, avatarUrl: true } } },
        orderBy: { checkinAt: 'desc' },
        take: 5,
      }),
      prisma.classSchedule.findMany({
        where: { startAt: { gte: todayStart, lte: todayEnd } },
        include: { gymClass: { include: { trainer: { include: { user: { select: { fullName: true } } } } } } },
        orderBy: { startAt: 'asc' },
      }),
      prisma.equipment.count({ where: { status: { in: ['MAINTENANCE', 'BROKEN'] } } }),
    ])

    // Revenue last 12 months
    const revenueByMonth = []
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const rev = await prisma.payment.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      })
      revenueByMonth.push({ month: dayjs(start).format('MM/YYYY'), amount: Number(rev._sum.amount || 0) })
    }

    // Check-ins last 7 days
    const checkInsByDay = []
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day')
      const start = d.startOf('day').toDate()
      const end = d.endOf('day').toDate()
      const count = await prisma.checkIn.count({ where: { checkinAt: { gte: start, lte: end } } })
      checkInsByDay.push({ day: d.format('DD/MM'), count })
    }

    return successResponse({
      kpi: {
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        todayCheckIns,
        monthRevenue: Number(monthRevenue._sum.amount || 0),
        expiringIn7Days,
        maintenanceDue,
      },
      revenueByMonth,
      checkInsByDay,
      recentCheckIns,
      todayClasses,
    })
  } catch (err) {
    console.error(err)
    return errorResponse('Lỗi server', 'SERVER_ERROR', 500)
  }
}
