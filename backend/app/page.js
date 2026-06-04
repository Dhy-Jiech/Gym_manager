import { NextResponse } from 'next/server'

export default function Home() {
  return NextResponse.json({ message: 'GymPro API Server', version: '1.0.0', status: 'running' })
}
