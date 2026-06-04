export const metadata = {
  title: 'GymPro Management',
  description: 'Hệ thống quản lý phòng gym toàn diện',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
