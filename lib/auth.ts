import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const COOKIE_NAME = '__lucky_token'

function getSecret() {
  const secret = process.env.APP_SECRET ?? 'change_me_to_random_hex'
  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  sub: string
  isAdmin: boolean
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ isAdmin: payload.isAdmin })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      sub: payload.sub as string,
      isAdmin: payload.isAdmin as boolean,
    }
  } catch {
    return null
  }
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10)
}

export async function comparePassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash)
}

export async function getSession(request?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined

  if (request) {
    token = request.cookies.get(COOKIE_NAME)?.value
  } else {
    const cookieStore = cookies()
    token = cookieStore.get(COOKIE_NAME)?.value
  }

  if (!token) return null
  return verifyToken(token)
}

export { COOKIE_NAME }
