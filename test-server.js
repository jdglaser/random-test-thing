import fs from 'fs'
import http from 'http'
import path from 'path'
import { build } from './build-utils.js'

const host = 'localhost'
const port = 8000

const requestListener = function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.writeHead(200)
  const data = { message: 'this is a JSON response' }
  writeTestFile(data)
  build()
  res.end(JSON.stringify(data))
}

const writeTestFile = (data) => {
  const outputPath = path.resolve('./test.json')
  console.log(outputPath)
  fs.writeFileSync(outputPath, JSON.stringify(data))
}

const server = http.createServer(requestListener)
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})
