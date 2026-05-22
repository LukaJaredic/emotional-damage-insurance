import { drop, factory } from '@mswjs/data'

import { models } from './db.models'
import { seed, type SeedProfile } from './db.seed'

export const db = factory(models)

export type Model = keyof typeof models

const dbFilePath = process.env.MOCK_DB_FILE ?? 'mocked-db.json'
const seedProfile = (process.env.MOCK_DB_SEED_PROFILE ?? 'dev') as SeedProfile

function getEmptyData() {
  return {
    user: [],
  }
}

export const loadDb = async () => {
  if (process.env.NODE_ENV === 'test') {
    return getEmptyData()
  }

  const { readFile, writeFile } = await import('fs/promises')

  try {
    const data = await readFile(dbFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      const emptyData = getEmptyData()
      await writeFile(dbFilePath, JSON.stringify(emptyData, null, 2))
      return emptyData
    }

    console.error('Error loading mocked DB:', error)
    return getEmptyData()
  }
}

export const storeDb = async (data: string) => {
  if (process.env.NODE_ENV === 'test') {
    return
  }

  const { writeFile } = await import('fs/promises')
  await writeFile(dbFilePath, data)
}

export const persistDb = async (model: Model) => {
  if (process.env.NODE_ENV === 'test') {
    return
  }

  const data = await loadDb()
  data[model] = db[model].getAll()
  await storeDb(JSON.stringify(data))
}

export const initializeDb = async () => {
  const database = await loadDb()

  Object.entries(db).forEach(([key, model]) => {
    const dataEntries = database[key] as Array<Record<string, any>> | undefined

    if (dataEntries) {
      dataEntries.forEach((entry) => {
        model.create(entry)
      })
    }
  })

  seed(db, seedProfile)

  console.log(
    `Seeded mock DB with '${seedProfile}' profile and admin user 'admin@example.com'`,
  )
}

export const resetDb = () => {
  drop(db)
}
