import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWebSocket } from '../use-websocket'

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  url: string
  protocols?: string[]
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  send = vi.fn()
  close = vi.fn()

  /** When true, new sockets fail instead of opening (an unreachable server). */
  static failToConnect = false

  constructor(url: string, protocols?: string[]) {
    this.url = url
    this.protocols = protocols

    // Simulate the connection opening (or failing) shortly after creation
    setTimeout(() => {
      if (MockWebSocket.failToConnect) {
        this.simulateError()
        return
      }
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 10)
  }

  // Helper method for testing
  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }))
    }
  }

  simulateError() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }
}

// Mock global WebSocket
// A plain function wrapper: vi.fn's type wants a callable, not a class. When the
// hook calls `new WebSocket(...)`, the returned instance is what it receives.
const mockWebSocket = Object.assign(
  vi.fn(function (url: string, protocols?: string[]) {
    return new MockWebSocket(url, protocols)
  }),
  // The hook compares readyState against these statics.
  { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 },
)
vi.stubGlobal('WebSocket', mockWebSocket)

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    MockWebSocket.failToConnect = false
    // Pin the reconnect jitter so backoff delays are exactly the base interval.
    vi.spyOn(Math, 'random').mockReturnValue(1)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should connect to WebSocket on mount', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:3000/ws' })
    )

    // waitFor polls on real timers, so with fake timers assert after advancing.
    expect(result.current.isConnecting).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.isConnected).toBe(true)
    expect(result.current.isConnecting).toBe(false)
  })

  it('should handle incoming messages', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:3000/ws' })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    const testMessage = {
      type: 'transaction_status',
      data: { id: 'tx-1', status: 'confirmed' },
      timestamp: new Date().toISOString(),
    }

    act(() => {
      // Get the WebSocket instance and simulate a message
      const ws = mockWebSocket.mock.results[0].value as MockWebSocket
      ws.simulateMessage(testMessage)
    })

    expect(result.current.lastMessage).toEqual(testMessage)
  })

  it('should send messages', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:3000/ws' })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    const message = { type: 'subscribe', payload: { transactions: ['tx-1'] } }

    act(() => {
      result.current.send(message)
    })

    const ws = mockWebSocket.mock.results[0].value as MockWebSocket
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify(message))
  })

  it('should handle connection errors', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:3000/ws' })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    act(() => {
      const ws = mockWebSocket.mock.results[0].value as MockWebSocket
      ws.simulateError()
    })

    expect(result.current.isConnected).toBe(false)
    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('should attempt reconnection on disconnect', async () => {
    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost:3000/ws',
        reconnectInterval: 1000,
        maxReconnectAttempts: 3,
      })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    // Simulate disconnection
    act(() => {
      const ws = mockWebSocket.mock.results[0].value as MockWebSocket
      ws.simulateError()
    })

    // The first retry fires after the base interval; stop before it opens
    // (which would reset the counter).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(result.current.reconnectAttempts).toBe(1)
    expect(mockWebSocket).toHaveBeenCalledTimes(2)
  })

  it('should stop reconnecting after max attempts', async () => {
    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost:3000/ws',
        reconnectInterval: 100,
        maxReconnectAttempts: 2,
      })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    // The server goes away: the open socket drops and every retry fails.
    MockWebSocket.failToConnect = true
    act(() => {
      const ws = mockWebSocket.mock.results[0].value as MockWebSocket
      ws.simulateError()
    })

    // Retries at 100ms and then 200ms (exponential backoff), each failing.
    // Advance in steps: each retry is scheduled by the render that follows the
    // previous failure, so one large jump would skip past it.
    for (let step = 0; step < 10; step++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100)
      })
    }

    expect(result.current.reconnectAttempts).toBe(2)
    expect(mockWebSocket).toHaveBeenCalledTimes(3)
    expect(result.current.error?.message).toContain('failed after 2 attempts')
  })

  it('should allow manual disconnect', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:3000/ws' })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    act(() => {
      result.current.disconnect()
    })

    expect(result.current.isConnected).toBe(false)
    expect(result.current.reconnectAttempts).toBe(0)
  })

  it('should allow manual reconnection', async () => {
    const { result } = renderHook(() =>
      useWebSocket({ url: 'ws://localhost:3000/ws' })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    // Disconnect
    act(() => {
      result.current.disconnect()
    })

    expect(result.current.isConnected).toBe(false)

    // Reconnect
    act(() => {
      result.current.reconnect()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10)
    })

    expect(result.current.isConnected).toBe(true)
  })
})
