import { afterEach, describe, it, expect, vi } from 'vitest'
import { getServerBackendUrl } from './env'

// getServerBackendUrl reads process.env on every call, so stubbing per test is
// enough; unstubAllEnvs restores whatever the runner had.
afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getServerBackendUrl', () => {
  it('throws for invalid URL value', () => {
    vi.stubEnv('BACKEND_URL', 'not-a-url')
    expect(() => getServerBackendUrl()).toThrow(/Invalid BACKEND_URL value/)
  })

  it('falls back to localhost in development when missing', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('BACKEND_URL', undefined)
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', undefined)
    expect(getServerBackendUrl()).toBe('http://localhost:4000')
  })

  it('throws when missing in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('BACKEND_URL', undefined)
    vi.stubEnv('NEXT_PUBLIC_BACKEND_URL', undefined)
    expect(() => getServerBackendUrl()).toThrow(/Missing BACKEND_URL/)
  })
})
