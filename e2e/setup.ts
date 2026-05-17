import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const e2eDbFilePath = resolve(process.cwd(), 'mocked-db.e2e.json')

async function globalSetup() {
  await rm(e2eDbFilePath, { force: true })
}

export default globalSetup
