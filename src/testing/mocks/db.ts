import { drop, factory, primaryKey } from '@mswjs/data'
import { nanoid } from 'nanoid'

const models = {
  user: {
    id: primaryKey(nanoid),
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: String,
    createdAt: Date.now,
  },
}

export const db = factory(models)

export type Model = keyof typeof models

const dbFilePath = process.env.MOCK_DB_FILE ?? 'mocked-db.json'

function getDefaultData() {
  return {
    user: [
      {
        id: nanoid(),
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: '2951957434',
        role: 'admin',
      },
    ],
  }
}

export const loadDb = async () => {
  if (process.env.NODE_ENV === 'test') return getDefaultData()

  const { readFile, writeFile } = await import('fs/promises')

  try {
    const data = await readFile(dbFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      const defaultData = getDefaultData()
      await writeFile(dbFilePath, JSON.stringify(defaultData, null, 2))
      return defaultData
    }

    console.error('Error loading mocked DB:', error)
    return getDefaultData()
  }
}

export const storeDb = async (data: string) => {
  if (process.env.NODE_ENV === 'test') return

  const { writeFile } = await import('fs/promises')
  await writeFile(dbFilePath, data)
}

export const persistDb = async (model: Model) => {
  if (process.env.NODE_ENV === 'test') return

  const data = await loadDb()
  data[model] = db[model].getAll()
  await storeDb(JSON.stringify(data))
}

export const initializeDb = async () => {
  const database = await loadDb()

  Object.entries(db).forEach(([key, model]) => {
    const dataEntries = database[key] as Array<Record<string, any>> | undefined

    if (dataEntries)
      dataEntries.forEach((entry) => {
        model.create(entry)
      })
  })

  if (db.user.getAll().length === 0) {
    const defaultUser = getDefaultData().user[0]

    if (!defaultUser) return

    db.user.create(defaultUser)
    persistDb('user')

    console.log(
      "Created default admin user with email: 'admin@example.com' and password: 'admin123'",
    )
  }
}

export const resetDb = () => {
  drop(db)
}
