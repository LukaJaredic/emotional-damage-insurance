import { delay } from 'msw'

import { db } from './db'

export const encode = (obj: any) => {
  return Buffer.from(JSON.stringify(obj), 'binary').toString('base64')
}

export const decode = (str: string) => {
  return JSON.parse(Buffer.from(str, 'base64').toString('binary'))
}

export const hash = (str: string) => {
  let hash = 5381,
    i = str.length

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i)
  }

  return String(hash >>> 0)
}

export const networkDelay = () => {
  return delay(200)
}

const omit = <T extends object>(obj: T, keys: string[]): T => {
  const result = {} as T
  for (const key in obj) {
    if (!keys.includes(key)) {
      result[key] = obj[key]
    }
  }

  return result
}

export const sanitizeUser = <O extends object>(user: O) =>
  omit<O>(user, ['password', 'iat'])

export function authenticate({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const user = db.user.findFirst({
    where: {
      email: {
        equals: email,
      },
    },
  })

  if (user?.password === hash(password)) {
    const sanitizedUser = sanitizeUser(user)
    const encodedToken = encode(sanitizedUser)
    return { user: sanitizedUser, jwt: encodedToken }
  }

  throw new Error('Invalid email or password')
}

export const AUTH_COOKIE = `token`

export function requireAuth(cookies: Record<string, string>) {
  try {
    const encodedToken = cookies[AUTH_COOKIE]

    if (!encodedToken) {
      return { error: 'Unauthorized', user: null }
    }

    const decodedToken = decode(encodedToken) as { id: string }

    const user = db.user.findFirst({
      where: {
        id: {
          equals: decodedToken.id,
        },
      },
    })

    if (!user) {
      return { error: 'Unauthorized', user: null }
    }

    return { user: sanitizeUser(user) }
  } catch {
    return { error: 'Unauthorized', user: null }
  }
}
