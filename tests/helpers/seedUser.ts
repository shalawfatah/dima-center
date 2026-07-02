import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

// 🎯 Fix 1: Add "as const" so TypeScript treats this as a literal shape rather than generic strings
export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
} as const

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user
  // 🎯 Fix 2: Force explicit assertion to align with payload collection creation structures
  await payload.create({
    collection: 'users',
    data: {
      email: testUser.email,
      password: testUser.password,
    } as any,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
