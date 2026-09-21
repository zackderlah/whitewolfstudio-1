import {createServer} from 'node:http'
import {readFile, stat} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const port = Number(process.env.PORT || 5199)

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
  if (!request.url) {
    send(response, 400, 'Bad request', {'Content-Type': 'text/plain; charset=utf-8'})
    return
  }

  const url = new URL(request.url, `http://${request.headers.host || `localhost:${port}`}`)
  serveStatic(request, response, url).catch((error) => {
    console.error(error)
    send(response, 500, 'Internal server error', {'Content-Type': 'text/plain; charset=utf-8'})
  })
}).listen(port, () => {
  console.log(`Site running at http://localhost:${port}`)
})
