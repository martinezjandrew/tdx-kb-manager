export class SlidingWindowRateLimiter {
  private callTimestamps: number[] = []
  private readonly maxCalls: number
  private readonly windowMs: number
  private pending: Promise<void> = Promise.resolve()

  constructor(maxCalls: number, windowMs: number) {
    this.maxCalls = maxCalls
    this.windowMs = windowMs
  }

  async acquire(): Promise<void> {
    // Serialize requests
    const myTurn = this.pending
    let resolve: () => void
    this.pending = new Promise((r) => (resolve = r))

    await myTurn

    const now = Date.now()
    const windowStart = now - this.windowMs

    // Remove timestamps outside the window
    this.callTimestamps = this.callTimestamps.filter((t) => t > windowStart)

    if (this.callTimestamps.length < this.maxCalls) {
      this.callTimestamps.push(now)
      resolve!()
      return
    }

    // Wait until the oldest call exits the window
    const oldestCall = this.callTimestamps[0]
    const waitTime = oldestCall + this.windowMs - now

    await new Promise((res) => setTimeout(res, waitTime))

    // Add current call timestamp
    this.callTimestamps.shift() // Remove oldest
    this.callTimestamps.push(Date.now())
    resolve!()
  }
}
