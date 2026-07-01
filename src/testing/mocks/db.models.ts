import { primaryKey } from '@mswjs/data'
import { nanoid } from 'nanoid'

import { DEFAULT_AUDIT_USER_ID } from './audit'

export const models = {
  user: {
    id: primaryKey(nanoid),
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    roles: Array,
    createdAt: Date.now,
    lastEditedAt: Date.now,
    createdBy: () => DEFAULT_AUDIT_USER_ID,
    lastEditedBy: () => DEFAULT_AUDIT_USER_ID,
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
    createdAt: Date.now,
    lastEditedAt: Date.now,
    createdBy: () => DEFAULT_AUDIT_USER_ID,
    lastEditedBy: () => DEFAULT_AUDIT_USER_ID,
  },
}
