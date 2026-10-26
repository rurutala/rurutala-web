import assert from 'node:assert/strict'
import test from 'node:test'
import { initializeApp, deleteApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getCache } from '@vercel/functions'
import likesHandler from '../api/likes.js'
import swordHandler from '../api/sword.js'
import { createSignalingHandler } from '../lib/sword-signaling.mjs'

async function callLikes(method, body) {
  const result = { headers: {} }
  const response = {
    setHeader(name, value) {
      result.headers[name.toLowerCase()] = value
    },
    end(payload) {
      result.status = this.statusCode
      result.body = JSON.parse(payload)
    },
  }
  await likesHandler({ method, body }, response)
  return result
}

test('updated server SDKs retain the Firestore and Vercel APIs used by the site', async () => {
  const app = initializeApp({ projectId: 'dependency-compatibility-test' }, 'dependency-compatibility-test')
  const database = getFirestore(app)
  try {
    assert.equal(typeof getCache, 'function')
    assert.equal(typeof swordHandler.fetch, 'function')
    const document = database.collection('like_counts').doc('work:test')
    assert.equal(document.path, 'like_counts/work:test')
    assert.equal(typeof document.set, 'function')
    assert.equal(typeof document.get, 'function')
    assert.equal(typeof database.runTransaction, 'function')
    assert(FieldValue.increment(1).isEqual(FieldValue.increment(1)))
    assert(FieldValue.serverTimestamp().isEqual(FieldValue.serverTimestamp()))
  } finally {
    await database.terminate()
    await deleteApp(app)
  }
})

test('likes API preserves local counting, payload validation and response headers', async (context) => {
  // Keep this test offline even when the caller has production credentials configured.
  const keys = ['FIREBASE_SERVICE_ACCOUNT_JSON', 'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'VERCEL']
  const environment = new Map(keys.map((key) => [key, process.env[key]]))
  for (const key of keys) {
    delete process.env[key]
  }
  const itemKey = 'work:dependency-compatibility-test'
  const store = globalThis.__rurutalaLikes
  const previous = store.get(itemKey)
  const hadPrevious = store.has(itemKey)
  store.delete(itemKey)
  context.after(() => {
    for (const [key, value] of environment) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
    if (hadPrevious) {
      store.set(itemKey, previous)
    } else {
      store.delete(itemKey)
    }
  })

  const increment = await callLikes('POST', { itemKey, delta: 1 })
  assert.equal(increment.status, 200)
  assert.deepEqual(increment.body, { count: 1 })
  assert.equal(increment.headers['cache-control'], 'no-store')
  assert.equal((await callLikes('GET')).body.counts[itemKey], 1)
  assert.deepEqual((await callLikes('POST', { itemKey, delta: -1 })).body, { count: 0 })
  assert.deepEqual((await callLikes('POST', { itemKey, delta: -1 })).body, { count: 0 })
  assert.equal((await callLikes('POST', { itemKey: '../invalid', delta: 1 })).status, 400)
  assert.equal((await callLikes('POST', { itemKey, delta: 2 })).status, 400)
  const unsupported = await callLikes('DELETE')
  assert.equal(unsupported.status, 405)
  assert.equal(unsupported.headers.allow, 'GET, POST')
})

test('pairing preserves QR creation, offer/answer exchange, authorization and expiry', async () => {
  const values = new Map()
  const cache = {
    get: (key) => values.get(key),
    set: (key, value) => values.set(key, value),
    delete: (key) => values.delete(key),
  }
  let now = 1000
  const handler = createSignalingHandler(() => cache, () => now)
  const endpoint = 'https://example.test/api/sword'
  const offer = 'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n'
  const created = await handler(new Request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Sword-Client': 'unity' },
    body: JSON.stringify({ Sdp: offer }),
  }))
  assert.equal(created.status, 200)
  assert.equal(created.headers.get('cache-control'), 'no-store')
  const session = await created.json()
  assert(session.QrSize > 0)
  assert.equal(session.QrModules.length, session.QrSize ** 2)
  const joinUrl = new URL(session.JoinUrl)
  assert.equal(joinUrl.pathname, '/sword/')
  const fragment = new URLSearchParams(joinUrl.hash.slice(1))
  const phoneUrl = `${endpoint}?room=${session.SessionId}&role=phone`
  const unityUrl = `${endpoint}?room=${session.SessionId}&role=unity`
  const phoneHeaders = { Authorization: `Bearer ${fragment.get('token')}` }
  const unityHeaders = { Authorization: `Bearer ${session.UnityToken}` }
  assert.equal(fragment.get('room'), session.SessionId)
  assert.equal((await handler(new Request(phoneUrl))).status, 403)
  assert.equal((await handler(new Request(phoneUrl, {
    headers: { ...phoneHeaders, Origin: 'https://other.test' },
  }))).status, 403)
  const receivedOffer = await handler(new Request(phoneUrl, { headers: phoneHeaders }))
  assert.equal((await receivedOffer.json()).Sdp, offer)
  const answer = `${offer}a=sctp-port:5000\r\n`
  const answered = await handler(new Request(phoneUrl, {
    method: 'POST',
    headers: { ...phoneHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ Sdp: answer }),
  }))
  assert.equal(answered.status, 200)
  assert.deepEqual(await answered.json(), { Ready: true })
  const receivedAnswer = await handler(new Request(unityUrl, { headers: unityHeaders }))
  assert.equal((await receivedAnswer.json()).Sdp, answer)
  now = session.ExpiresAt * 1000
  assert.equal((await handler(new Request(phoneUrl, { headers: phoneHeaders }))).status, 410)
})
