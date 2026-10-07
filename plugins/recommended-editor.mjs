import { Buffer } from 'node:buffer'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const endpoint = '/__local/recommended-order'
const loopbackAddresses = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])
const loopbackHosts = new Set(['127.0.0.1', 'localhost', '[::1]'])

export function recommendedEditor() {
    return {
        name: 'local-recommended-editor',
        apply: 'serve',
        configureServer(server) {
            const orderFile = resolve(server.config.root, 'src/data/recommended-order.json')

            server.middlewares.use(async (request, response, next) => {
                if (request.url?.split('?')[0] !== endpoint) {
                    next()
                    return
                }

                const reply = (status, data) => {
                    response.writeHead(status, {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Cache-Control': 'no-store',
                    })
                    response.end(JSON.stringify(data))
                }

                try {
                    const host = new URL(`http://${request.headers.host}`)
                    if (!loopbackAddresses.has(request.socket.remoteAddress) || !loopbackHosts.has(host.hostname)) {
                        reply(403, { error: 'ローカル環境からアクセスしてください。' })
                        return
                    }
                    if (request.method !== 'GET' && request.method !== 'PUT') {
                        reply(405, { error: '対応していない操作です。' })
                        return
                    }
                    if (request.method === 'PUT' && request.headers.origin !== host.origin) {
                        reply(403, { error: '同じローカル画面から保存してください。' })
                        return
                    }

                    const { works, compareWorksByRecommendation } = await server.ssrLoadModule('/src/data/works.js')
                    if (request.method === 'GET') {
                        reply(200, { order: [...works].sort(compareWorksByRecommendation).map((work) => work.id) })
                        return
                    }
                    if (request.headers['content-type']?.split(';')[0] !== 'application/json') {
                        reply(415, { error: 'JSON形式で保存してください。' })
                        return
                    }

                    const chunks = []
                    let bytes = 0
                    for await (const chunk of request) {
                        bytes += chunk.length
                        if (bytes > 16384) {
                            reply(413, { error: '保存データが大きすぎます。' })
                            return
                        }
                        chunks.push(chunk)
                    }
                    const { order } = JSON.parse(Buffer.concat(chunks).toString('utf8'))
                    const workIds = new Set(works.map((work) => work.id))
                    if (!Array.isArray(order) || order.length !== works.length || new Set(order).size !== works.length || order.some((id) => !workIds.has(id))) {
                        reply(400, { error: '作品の一覧が変わりました。画面を再読み込みしてください。' })
                        return
                    }

                    await writeFile(orderFile, `${JSON.stringify(order, null, 2)}\n`, 'utf8')
                    reply(200, { order })
                } catch (error) {
                    if (error instanceof SyntaxError) {
                        reply(400, { error: '保存データを確認してください。' })
                        return
                    }
                    server.config.logger.error(error.stack || error.message)
                    reply(500, { error: '保存できませんでした。もう一度お試しください。' })
                }
            })
        },
    }
}
