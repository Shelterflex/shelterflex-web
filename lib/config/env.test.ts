import { describe, it, expect } from 'vitest'

describe('getServerBackendUrl', () => {
  it('throws for invalid URL value', () => {
    process.env.BACKEND_URL = 'not-a-url'
    const { getServerBackendUrl } = require('./env')
    expect(() => getServerBackendUrl()).toThrow(/Invalid BACKEND_URL value/)
    delete process.env.BACKEND_URL
  })

  it('falls back to localhost in development when missing', () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    delete process.env.BACKEND_URL
    delete process.env.NEXT_PUBLIC_BACKEND_URL
    const { getServerBackendUrl } = require('./env')
    expect(getServerBackendUrl()).toBe('http://localhost:4000')
    process.env.NODE_ENV = prev
  })

  it('throws when missing in production', () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    delete process.env.BACKEND_URL
    delete process.env.NEXT_PUBLIC_BACKEND_URL
    const { getServerBackendUrl } = require('./env')
    expect(() => getServerBackendUrl()).toThrow(/Missing BACKEND_URL/)
    process.env.NODE_ENV = prev
  })
})
