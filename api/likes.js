/* global process */

const LIKE_HASH_KEY = 'rurutala:likes'
const ITEM_KEY_PATTERN = /^(work|article):[a-z0-9-]+$/

const memoryStore = globalThis.__rurutalaLikes ?? new Map()
globalThis.__rurutalaLikes = memoryStore

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(payload))
}

function normalizeCounts(rawCounts) {
  if (!rawCounts) {
    return {}
  }

  if (Array.isArray(rawCounts)) {
    return rawCounts.reduce((counts, value, index) => {
      if (index % 2 === 0) {
        counts[value] = Number(rawCounts[index + 1]) || 0
      }

      return counts
    }, {})
  }

  return Object.fromEntries(
    Object.entries(rawCounts).map(([key, value]) => [key, Number(value) || 0]),
  )
}

function getRequestBody(request) {
  if (request.body && typeof request.body === 'object') {
    return Promise.resolve(request.body)
  }

  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    return null
  }

  return { token, url }
}

async function runRedisCommand(command) {
  const config = getUpstashConfig()

  if (!config) {
    return null
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })

  if (!response.ok) {
    throw new Error(`Redis command failed with ${response.status}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error)
  }

  return data.result
}

async function getCounts() {
  const redisCounts = await runRedisCommand(['HGETALL', LIKE_HASH_KEY])

  if (redisCounts !== null) {
    return normalizeCounts(redisCounts)
  }

  return Object.fromEntries(memoryStore)
}

async function incrementCount(itemKey, delta) {
  const redisCount = await runRedisCommand(['HINCRBY', LIKE_HASH_KEY, itemKey, delta])

  if (redisCount !== null) {
    const count = Math.max(0, Number(redisCount) || 0)

    if (count === 0 && Number(redisCount) < 0) {
      await runRedisCommand(['HSET', LIKE_HASH_KEY, itemKey, 0])
    }

    return count
  }

  const nextCount = Math.max(0, (memoryStore.get(itemKey) ?? 0) + delta)
  memoryStore.set(itemKey, nextCount)
  return nextCount
}

export default async function handler(request, response) {
  try {
    if (request.method === 'GET') {
      sendJson(response, 200, { counts: await getCounts() })
      return
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST')
      sendJson(response, 405, { error: 'Method not allowed' })
      return
    }

    const body = await getRequestBody(request)
    const itemKey = String(body.itemKey ?? '')
    const delta = Number(body.delta)

    if (!ITEM_KEY_PATTERN.test(itemKey) || ![-1, 1].includes(delta)) {
      sendJson(response, 400, { error: 'Invalid like payload' })
      return
    }

    const count = await incrementCount(itemKey, delta)
    sendJson(response, 200, { count })
  } catch (error) {
    sendJson(response, 500, { error: error.message })
  }
}
