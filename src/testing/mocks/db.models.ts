import { primaryKey } from '@mswjs/data'
import { nanoid } from 'nanoid'

export const models = {
  user: {
    id: primaryKey(nanoid),
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    roles: Array,
    createdAt: Date.now,
  },
  policyHolder: {
    id: primaryKey(nanoid),
    type: String,
    governmentId: String,
    email: String,
    phone: String,
    firstName: String,
    lastName: String,
    businessName: String,
  },
}
