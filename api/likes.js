/* global process */

import mysql from 'mysql2/promise'

const ITEM_KEY_PATTERN = /^(work|article):[a-z0-9-]+$/

const memoryStore = globalThis.__rurutalaLikes ?? new Map()
globalThis.__rurutalaLikes = memoryStore

let pool = null
let isSchemaReady = false

function getSslConfig() {
  if (process.env.MYSQL_SSL !== 'true') {
    return undefined
  }

  return {}
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(payload))
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

function hasMysqlConfig() {
  return Boolean(
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    (process.env.MYSQL_HOST && process.env.MYSQL_DATABASE && process.env.MYSQL_USER),
  )
}

function createPool() {
  const uri = process.env.DATABASE_URL ?? process.env.MYSQL_URL

  if (uri) {
    return mysql.createPool({
      uri,
      ssl: getSslConfig(),
      connectionLimit: 5,
      enableKeepAlive: true,
      waitForConnections: true,
    })
  }

  return mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    connectionLimit: 5,
    enableKeepAlive: true,
    waitForConnections: true,
    ssl: getSslConfig(),
  })
}

function getPool() {
  if (!hasMysqlConfig()) {
    return null
  }

  if (!pool) {
    pool = createPool()
  }

  return pool
}

async function ensureSchema(database) {
  if (isSchemaReady) {
    return
  }

  await database.execute(`
    CREATE TABLE IF NOT EXISTS like_counts (
      item_key VARCHAR(191) NOT NULL PRIMARY KEY,
      like_count INT UNSIGNED NOT NULL DEFAULT 0,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  isSchemaReady = true
}

async function getCountsFromMysql(database) {
  await ensureSchema(database)

  const [rows] = await database.execute('SELECT item_key, like_count FROM like_counts')

  return Object.fromEntries(
    rows.map((row) => [row.item_key, Number(row.like_count) || 0]),
  )
}

async function incrementMysqlCount(database, itemKey, delta) {
  await ensureSchema(database)

  await database.execute(
    `
      INSERT INTO like_counts (item_key, like_count)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE like_count = GREATEST(0, CAST(like_count AS SIGNED) + ?)
    `,
    [itemKey, Math.max(0, delta), delta],
  )

  const [rows] = await database.execute(
    'SELECT like_count FROM like_counts WHERE item_key = ? LIMIT 1',
    [itemKey],
  )

  return Number(rows[0]?.like_count) || 0
}

async function getCounts() {
  const database = getPool()

  if (database) {
    return getCountsFromMysql(database)
  }

  return Object.fromEntries(memoryStore)
}

async function incrementCount(itemKey, delta) {
  const database = getPool()

  if (database) {
    return incrementMysqlCount(database, itemKey, delta)
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
