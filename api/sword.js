import { getCache } from '@vercel/functions'
import { createSignalingHandler } from '../lib/sword-signaling.mjs'

const handler = createSignalingHandler(() => getCache({ namespace: 'sword-pairing-v1' }))

export default { fetch: handler }
