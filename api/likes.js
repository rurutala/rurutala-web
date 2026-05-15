/* global process */

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const COLLECTION_NAME = 'like_counts'
const ITEM_KEY_PATTERN = /^(work|article):[a-z0-9-]+$/

const memoryStore = globalThis.__rurutalaLikes ?? new Map()
globalThis.__rurutalaLikes = memoryStore

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

function parseServiceAccountJson() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return null
  }

  return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
}

function getFirebaseCredentialConfig() {
  const serviceAccount = parseServiceAccountJson()

  if (serviceAccount) {
    return {
      credential: cert({
        ...serviceAccount,
        private_key: serviceAccount.private_key?.replace(/\\n/g, '\n'),
      }),
    }
  }

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    return null
  }

  return {
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  }
}

function getDatabase() {
  const config = getFirebaseCredentialConfig()

  if (!config) {
    if (process.env.VERCEL) {
      throw new Error('Firebase credentials are not configured')
    }

    return null
  }

  if (!getApps().length) {
    initializeApp(config)
  }

  return getFirestore()
}

async function getCountsFromFirestore(database) {
  const snapshot = await database.collection(COLLECTION_NAME).get()

  return Object.fromEntries(
    snapshot.docs.map((document) => [
      document.id,
      Number(document.data().like_count) || 0,
    ]),
  )
}

async function incrementFirestoreCount(database, itemKey, delta) {
  const documentRef = database.collection(COLLECTION_NAME).doc(itemKey)

  if (delta > 0) {
    await documentRef.set(
      {
        item_key: itemKey,
        like_count: FieldValue.increment(1),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
  } else {
    await database.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(documentRef)
      const currentCount = Number(snapshot.data()?.like_count) || 0
      const nextCount = Math.max(0, currentCount - 1)

      transaction.set(
        documentRef,
        {
          item_key: itemKey,
          like_count: nextCount,
          updated_at: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
    })
  }

  const updatedSnapshot = await documentRef.get()
  return Number(updatedSnapshot.data()?.like_count) || 0
}

async function getCounts() {
  const database = getDatabase()

  if (database) {
    return getCountsFromFirestore(database)
  }

  return Object.fromEntries(memoryStore)
}

async function incrementCount(itemKey, delta) {
  const database = getDatabase()

  if (database) {
    return incrementFirestoreCount(database, itemKey, delta)
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
