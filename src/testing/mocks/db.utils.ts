import { db } from './db'
import { hash, encode, decode, sanitizeUser } from './helpers'

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
