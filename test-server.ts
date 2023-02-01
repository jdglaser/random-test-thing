import fs from 'fs'
import http, {IncomingMessage, ServerResponse} from 'http'
import path from 'path'
import {buildLocalDir} from './build-utils-two.js'

const host = 'localhost'
const port = 8000

const requestListener = function (req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')
  res.writeHead(200)
  const data = { message: 'this is a JSON response' }
  buildLocalDir()
  res.end(JSON.stringify(data))
}

const writeTestFile = (data: string) => {
  const outputPath = path.resolve('./test.json')
  console.log(outputPath)
  fs.writeFileSync(outputPath, JSON.stringify(data))
}

const server = http.createServer(requestListener)
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})
