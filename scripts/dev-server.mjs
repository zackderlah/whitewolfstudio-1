import {createServer} from 'node:http'
import {readFile, stat} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const port = Number(process.env.PORT || 5199)

const sanityConfig = {
  projectId: 'ap45bjk4',
  dataset: 'production',
  apiVersion: '2024-01-01',
}

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

const send = (response, status, body, headers = {}) => {
  response.writeHead(status, headers)
  response.end(body)
}

const proxySanityQuery = async (request, response, url, bodyPromise) => {
  let query = url.searchParams.get('query')

  if (request.method === 'POST') {
    const body = await bodyPromise
    try {
      query = JSON.parse(body)?.query ?? query
    } catch {
      send(response, 400, 'Invalid JSON body', {'Content-Type': 'text/plain; charset=utf-8'})
      return
    }
  }

  if (!query) {
    send(response, 400, 'Missing query parameter', {'Content-Type': 'text/plain; charset=utf-8'})
    return
  }

  const target = new URL(
    `https://${sanityConfig.projectId}.apicdn.sanity.io/v${sanityConfig.apiVersion}/data/query/${sanityConfig.dataset}`,
  )

  const upstream = await fetch(target, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({query}),
  })
  const body = await upstream.text()

  send(response, upstream.status, body, {
    'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
}

const readRequestBody = (request) =>
  new Promise((resolve, reject) => {
    const chunks = []
    request.on('data', (chunk) => chunks.push(chunk))
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })

const serveStatic = async (request, response, url) => {
  let pathname = decodeURIComponent(url.pathname)
  if (pathname === '/') {
    pathname = '/index.html'
  }

  const filePath = path.join(root, pathname)

  if (!filePath.startsWith(root)) {
    send(response, 403, 'Forbidden', {'Content-Type': 'text/plain; charset=utf-8'})
    return
  }

  try {
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      send(response, 404, 'Not found', {'Content-Type': 'text/plain; charset=utf-8'})
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const body = await readFile(filePath)
    send(response, 200, body, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=3600',
    })
  } catch {
    send(response, 404, 'Not found', {'Content-Type': 'text/plain; charset=utf-8'})
  }
}

createServer((request, response) => {
  const bodyPromise =
    request.method === 'POST' ? readRequestBody(request) : Promise.resolve('')

  handleRequest(request, response, bodyPromise).catch((error) => {
    console.error(error)
    send(response, 500, 'Internal server error', {'Content-Type': 'text/plain; charset=utf-8'})
  })
}).listen(port, () => {
  console.log(`Site running at http://localhost:${port}`)
  console.log('Sanity content is proxied through /api/sanity/query for local preview.')
})

async function handleRequest(request, response, bodyPromise) {
  if (!request.url) {
    send(response, 400, 'Bad request', {'Content-Type': 'text/plain; charset=utf-8'})
    return
  }

  const url = new URL(request.url, `http://${request.headers.host || `localhost:${port}`}`)

  if (url.pathname === '/api/sanity/query' && (request.method === 'GET' || request.method === 'POST')) {
    await proxySanityQuery(request, response, url, bodyPromise)
    return
  }

  await serveStatic(request, response, url)
}
