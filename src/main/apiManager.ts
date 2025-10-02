import * as api from './api'
import { SlidingWindowRateLimiter } from './slidingWindow'

const limiter = new SlidingWindowRateLimiter(60, 60_000)

function withRateLimit<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    await limiter.acquire()
    return fn(...args)
  }) as T
}

export const limitedApi = {
  updateArticle: withRateLimit(api.updateArticle)
}
