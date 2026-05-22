import { delay } from 'msw'

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
