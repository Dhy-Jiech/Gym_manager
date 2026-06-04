import { verifyAccessToken } from './jwt.js'
import { NextResponse } from 'next/server'

export async function getAuthUser(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 }
  }
  try {
    const token = authHeader.split(' ')[1]
    const payload = verifyAccessToken(token)
    return { user: payload }
  } catch {
    return { error: 'Token invalid or expired', status: 401 }
  }
}

export function requireAuth(handler, ...allowedRoles) {
  return async function(request, context) {
    const { user, error, status } = await getAuthUser(request)
    if (error) {
      return NextResponse.json({ success: false, error, message: error }, { status })
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden', message: 'Bạn không có quyền thực hiện thao tác này' }, { status: 403 })
    }
    request.user = user
    return handler(request, context)
  }
}

export function successResponse(data, message = 'Thành công', meta = null, status = 200) {
  const body = { success: true, data, message }
  if (meta) body.meta = meta
  return NextResponse.json(body, { status })
}

export function errorResponse(message, error = 'ERROR', status = 400, details = null) {
  const body = { success: false, error, message }
  if (details) body.details = details
  return NextResponse.json(body, { status })
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
