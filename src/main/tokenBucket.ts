export class TokenBucket {
  private tokens: number
  private readonly capacity: number
  private readonly refillRate: number
  private lastRefill: number

  constructor(capacity: number, refillPerMinute: number) {
    this.capacity = capacity
    this.tokens = capacity
    this.refillRate = refillPerMinute / 60_000
    this.lastRefill = Date.now()
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    this.lastRefill = now

    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate)
  }

  async removeToken(): Promise<void> {
    while (true) {
      this.refill()
      if (this.tokens >= 1) {
        this.tokens -= 1
        return
      }
      await new Promise((res) => setTimeout(res, 100))
    }
  }
}
