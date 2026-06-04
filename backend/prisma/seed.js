const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up
  await prisma.auditLog.deleteMany()
  await prisma.classBooking.deleteMany()
  await prisma.classSchedule.deleteMany()
  await prisma.gymClass.deleteMany()
  await prisma.ptSession.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.membershipPlan.deleteMany()
  await prisma.checkIn.deleteMany()
  await prisma.member.deleteMany()
  await prisma.maintenanceLog.deleteMany()
  await prisma.equipment.deleteMany()
  await prisma.trainer.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.user.deleteMany()

  const hash = async (pw) => bcrypt.hash(pw, 12)

  // ---- USERS ----
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@gym.com',
      passwordHash: await hash('Admin@123'),
      fullName: 'Nguyễn Quản Trị',
      phone: '0901234567',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@gym.com',
      passwordHash: await hash('Manager@123'),
      fullName: 'Trần Thị Quản Lý',
      phone: '0902345678',
      role: 'MANAGER',
      isActive: true,
    },
  })

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@gym.com',
      passwordHash: await hash('Staff@123'),
      fullName: 'Lê Văn Nhân Viên',
      phone: '0903456789',
      role: 'STAFF',
      isActive: true,
    },
  })

  const trainerUser1 = await prisma.user.create({
    data: {
      email: 'trainer1@gym.com',
      passwordHash: await hash('Trainer@123'),
      fullName: 'Phạm Minh Huấn',
      phone: '0904567890',
      role: 'TRAINER',
      isActive: true,
    },
  })

  const trainerUser2 = await prisma.user.create({
    data: {
      email: 'trainer2@gym.com',
      passwordHash: await hash('Trainer@123'),
      fullName: 'Hoàng Thị Lan',
      phone: '0905678901',
      role: 'TRAINER',
      isActive: true,
    },
  })

  console.log('✅ Users created')

  // ---- TRAINERS ----
  const trainer1 = await prisma.trainer.create({
    data: {
      userId: trainerUser1.id,
      specialization: 'Cardio, HIIT, Weight Training',
      bio: 'HLV với 8 năm kinh nghiệm, chuyên về thể lực và giảm cân.',
      certifications: ['ACE Certified', 'CPR Certified', 'Yoga Level 2'],
      hourlyRate: 500000,
      isAvailable: true,
    },
  })

  const trainer2 = await prisma.trainer.create({
    data: {
      userId: trainerUser2.id,
      specialization: 'Yoga, Pilates, Stretching',
      bio: 'Chuyên gia Yoga 10 năm kinh nghiệm, đã đào tạo hơn 500 học viên.',
      certifications: ['RYT 200', 'Pilates Mat Certification'],
      hourlyRate: 450000,
      isAvailable: true,
    },
  })

  console.log('✅ Trainers created')

  // ---- MEMBERSHIP PLANS ----
  const planBasic = await prisma.membershipPlan.create({
    data: {
      name: 'Gói Cơ Bản',
      description: 'Phù hợp cho người mới bắt đầu, truy cập phòng gym cơ bản.',
      durationDays: 30,
      price: 350000,
      features: ['Gym access 6:00-22:00', 'Locker usage', 'Basic equipment'],
      isActive: true,
    },
  })

  const planStandard = await prisma.membershipPlan.create({
    data: {
      name: 'Gói Tiêu Chuẩn',
      description: 'Đầy đủ tiện nghi, bao gồm lớp học nhóm.',
      durationDays: 90,
      price: 900000,
      features: ['Gym access 24/7', 'Group classes', 'Locker usage', 'Towel service'],
      isActive: true,
    },
  })

  const planPremium = await prisma.membershipPlan.create({
    data: {
      name: 'Gói Cao Cấp',
      description: 'Trải nghiệm VIP với PT session hàng tháng.',
      durationDays: 365,
      price: 5500000,
      features: ['Gym access 24/7', 'All group classes', '2 PT sessions/month', 'Nutrition consultation', 'Spa access', 'Priority booking'],
      isActive: true,
    },
  })

  console.log('✅ Membership plans created')

  // ---- MEMBERS ----
  const memberData = [
    { fullName: 'Nguyễn Văn An', phone: '0911111111', email: 'an@email.com', gender: 'MALE', code: 'GYM00001' },
    { fullName: 'Trần Thị Bích', phone: '0922222222', email: 'bich@email.com', gender: 'FEMALE', code: 'GYM00002' },
    { fullName: 'Lê Minh Cường', phone: '0933333333', email: 'cuong@email.com', gender: 'MALE', code: 'GYM00003' },
    { fullName: 'Phạm Thị Dung', phone: '0944444444', email: 'dung@email.com', gender: 'FEMALE', code: 'GYM00004' },
    { fullName: 'Hoàng Văn Em', phone: '0955555555', email: 'em@email.com', gender: 'MALE', code: 'GYM00005' },
    { fullName: 'Võ Thị Phương', phone: '0966666666', email: 'phuong@email.com', gender: 'FEMALE', code: 'GYM00006' },
    { fullName: 'Đặng Minh Giang', phone: '0977777777', email: 'giang@email.com', gender: 'MALE', code: 'GYM00007' },
    { fullName: 'Bùi Thị Hoa', phone: '0988888888', email: 'hoa@email.com', gender: 'FEMALE', code: 'GYM00008' },
    { fullName: 'Phan Văn Inh', phone: '0999999999', email: 'inh@email.com', gender: 'MALE', code: 'GYM00009' },
    { fullName: 'Đinh Thị Kim', phone: '0910101010', email: 'kim@email.com', gender: 'FEMALE', code: 'GYM00010' },
    { fullName: 'Ngô Văn Long', phone: '0921212121', email: 'long@email.com', gender: 'MALE', code: 'GYM00011' },
    { fullName: 'Lý Thị Mai', phone: '0932323232', email: 'mai@email.com', gender: 'FEMALE', code: 'GYM00012' },
  ]

  const members = []
  for (const m of memberData) {
    const member = await prisma.member.create({
      data: {
        memberCode: m.code,
        fullName: m.fullName,
        phone: m.phone,
        email: m.email,
        gender: m.gender,
        qrCode: `GYM_MEMBER_${m.code}`,
        isActive: true,
        joinedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      },
    })
    members.push(member)
  }

  console.log('✅ Members created')

  // ---- MEMBERSHIPS ----
  const now = new Date()

  // Active memberships
  for (let i = 0; i < 8; i++) {
    const plan = i < 3 ? planBasic : i < 6 ? planStandard : planPremium
    const startDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
    await prisma.membership.create({
      data: {
        memberId: members[i].id,
        planId: plan.id,
        startDate,
        endDate,
        price: plan.price,
        status: 'ACTIVE',
      },
    })
  }

  // Expired memberships
  for (let i = 8; i < 12; i++) {
    const startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const endDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    await prisma.membership.create({
      data: {
        memberId: members[i].id,
        planId: planBasic.id,
        startDate,
        endDate,
        price: planBasic.price,
        status: 'EXPIRED',
      },
    })
  }

  console.log('✅ Memberships created')

  // ---- CHECK-INS (30 days) ----
  for (let day = 29; day >= 0; day--) {
    const date = new Date(now)
    date.setDate(date.getDate() - day)
    date.setHours(0, 0, 0, 0)
    const dailyCount = Math.floor(Math.random() * 8) + 3
    for (let j = 0; j < dailyCount && j < members.length; j++) {
      const checkinHour = 6 + Math.floor(Math.random() * 14)
      const checkinAt = new Date(date)
      checkinAt.setHours(checkinHour, Math.floor(Math.random() * 60), 0)
      const checkoutAt = new Date(checkinAt.getTime() + (60 + Math.floor(Math.random() * 60)) * 60000)
      await prisma.checkIn.create({
        data: { memberId: members[j % members.length].id, checkinAt, checkoutAt, method: 'QR' },
      })
    }
  }

  console.log('✅ Check-ins created')

  // ---- PAYMENTS (3 months) ----
  for (let i = 0; i < 30; i++) {
    const daysAgo = Math.floor(Math.random() * 90)
    const paidAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const member = members[i % members.length]
    const amounts = [350000, 900000, 5500000, 500000, 1000000]
    const methods = ['CASH', 'BANK_TRANSFER', 'VNPAY', 'MOMO']
    await prisma.payment.create({
      data: {
        memberId: member.id,
        amount: amounts[i % amounts.length],
        method: methods[i % methods.length],
        status: 'COMPLETED',
        paidAt,
        referenceCode: `PAY${String(i + 1).padStart(6, '0')}`,
      },
    })
  }

  console.log('✅ Payments created')

  // ---- GYM CLASSES ----
  const yoga = await prisma.gymClass.create({
    data: {
      name: 'Yoga Cơ Bản',
      description: 'Lớp yoga dành cho người mới bắt đầu.',
      trainerId: trainer2.id,
      capacity: 20,
      durationMin: 60,
      level: 'BEGINNER',
      location: 'Phòng 101',
      isActive: true,
    },
  })

  const hiit = await prisma.gymClass.create({
    data: {
      name: 'HIIT Toàn Thân',
      description: 'Tập luyện cường độ cao đốt cháy mỡ hiệu quả.',
      trainerId: trainer1.id,
      capacity: 15,
      durationMin: 45,
      level: 'INTERMEDIATE',
      location: 'Phòng 102',
      isActive: true,
    },
  })

  const zumba = await prisma.gymClass.create({
    data: {
      name: 'Zumba Dance',
      description: 'Khiêu vũ thể dục vui nhộn cho tất cả mọi người.',
      trainerId: trainer2.id,
      capacity: 25,
      durationMin: 60,
      level: 'ALL',
      location: 'Phòng 103',
      isActive: true,
    },
  })

  console.log('✅ Classes created')

  // ---- CLASS SCHEDULES (2 weeks) ----
  for (let day = -7; day <= 7; day++) {
    const d = new Date(now)
    d.setDate(d.getDate() + day)
    d.setHours(0, 0, 0, 0)
    if (day % 2 === 0) {
      await prisma.classSchedule.create({
        data: {
          classId: yoga.id,
          startAt: new Date(d.getTime() + 8 * 3600000),
          endAt: new Date(d.getTime() + 9 * 3600000),
          status: day < 0 ? 'COMPLETED' : 'SCHEDULED',
        },
      })
    }
    if (day % 3 === 0) {
      await prisma.classSchedule.create({
        data: {
          classId: hiit.id,
          startAt: new Date(d.getTime() + 18 * 3600000),
          endAt: new Date(d.getTime() + 18.75 * 3600000),
          status: day < 0 ? 'COMPLETED' : 'SCHEDULED',
        },
      })
    }
  }

  console.log('✅ Schedules created')

  // ---- EQUIPMENT ----
  const equipmentItems = [
    { name: 'Máy chạy bộ TechnoGym', category: 'Cardio', status: 'ACTIVE', location: 'Khu Cardio' },
    { name: 'Máy đạp xe Spinning', category: 'Cardio', status: 'ACTIVE', location: 'Khu Cardio' },
    { name: 'Barbel Set 20kg', category: 'Free Weight', status: 'ACTIVE', location: 'Khu Free Weight' },
    { name: 'Máy kéo xô (Cable Machine)', category: 'Machine', status: 'MAINTENANCE', location: 'Phòng Máy' },
    { name: 'Tạ tay 5-30kg', category: 'Free Weight', status: 'ACTIVE', location: 'Khu Free Weight' },
    { name: 'Máy Leg Press', category: 'Machine', status: 'ACTIVE', location: 'Phòng Máy' },
    { name: 'Máy Chest Press', category: 'Machine', status: 'BROKEN', location: 'Phòng Máy' },
    { name: 'Thảm Yoga (bộ 20 cái)', category: 'Accessories', status: 'ACTIVE', location: 'Phòng Yoga' },
  ]

  for (const eq of equipmentItems) {
    await prisma.equipment.create({
      data: {
        ...eq,
        purchaseDate: new Date(2023, Math.floor(Math.random() * 12), 1),
        purchasePrice: 5000000 + Math.floor(Math.random() * 45000000),
        nextMaintenanceAt: new Date(now.getTime() + (Math.random() * 60 - 10) * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('✅ Equipment created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('-----------------------------------')
  console.log('Demo accounts:')
  console.log('  Admin:   admin@gym.com       / Admin@123')
  console.log('  Manager: manager@gym.com     / Manager@123')
  console.log('  Staff:   staff@gym.com       / Staff@123')
  console.log('  Trainer: trainer1@gym.com    / Trainer@123')
  console.log('-----------------------------------')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
