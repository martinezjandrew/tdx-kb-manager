import { TokenBucket } from './tokenBucket'
import * as api from './api'

const bucket = new TokenBucket(60, 60)

function withRateLimit<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    await bucket.removeToken()
    return fn(...args)
  }) as T
}

export const limitedApi = {
  updateArticle: withRateLimit(api.updateArticle)
}
