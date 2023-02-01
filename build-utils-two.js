import fs from 'fs'
import Handlebars from 'handlebars'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/*
Function

File: {
  absPath: string
  absDir: string
  relDir: string
  fileName: string
  baseName: string
  ext: string
}

Partial: {
  name: string
  path: string
}

GetAllFilesResponse: {
  templates: File[]
  partials: File[]
  other: File[]
}
walkFiles() -> Generator<File>
getAllFiles() -> [File[], File[]] # non-partials, partials
getPartialsFromContent(content: string) -> {name: string, path: string}[]
buildFile(file: File) -> void
*/

export async function * walkFiles (dirName) {
  for await (const d of await fs.promises.opendir(dirName)) {
    const entry = path.join(dirName, d.name)
    if (d.isDirectory()) yield * walkFiles(entry)
    else if (d.isFile()) yield entry
  }
}

export async function getAllFiles (dirName) {
  const allFiles = [[], [], []]
  for await (const file of walkFiles(dirName)) {
    const absDir = path.dirname(file)
    const relDir = absDir.replace(dirName, '')
    const ext = path.extname(file)
    const fullName = path.basename(file)
    const baseName = fullName.replace(ext, '')

    const fileObject = {
      absPath: file,
      absDir,
      relDir,
      fullName,
      ext,
      baseName
    }

    switch (ext) {
      case '.html':
        allFiles[0].push(fileObject)
        break
      case '.hbs':
        allFiles[1].push(fileObject)
        break
      default:
        allFiles[2].push(fileObject)
    }
  }

  return allFiles
}

export async function getPartialsFromContent (content, outputDirName) {
  const regex = /{{> "?([a-zA-Z\\/0-9-]+)"?.*?}}/g
  const matches = content.matchAll(regex)

  const partials = []
  for (const match of matches) {
    const partialName = match[1]
    const pathToPartial = path.join(outputDirName, partialName, '.hbs')
    partials.push({
      name: match[1],
      path: pathToPartial
    })
  }
}

async function writeFileToOutputDir (outputDir, file, content) {
  const outputFilePath = path.join(outputDir, file.relDir, file.fullName)
  const outputDirPath = path.dirname(outputFilePath)
  if (!fs.existsSync(outputDirPath)) {
    await fs.promises.mkdir(outputDirPath)
  }
  fs.writeFileSync(outputFilePath, content)
}

async function buildTemplateFile (outputDir, file, hb) {
  const fileData = await fs.promises.readFile(file.absPath, 'utf-8')
  const template = hb.compile(fileData)
  const content = template(JSON.stringify({ title: file.baseName }))
  writeFileToOutputDir(outputDir, file, content)
}

export async function buildAllFiles (dirPath) {
  const hb = Handlebars.create()
  const outputDir = path.join(dirPath, 'output')
  const inputDir = path.join(dirPath, 'src')

  const [templates, partials, other] = await getAllFiles(inputDir)
  for (const file of partials) {
    const partialName = `${path.join(file.relDir, file.baseName)}`
    console.log(`Registering partial ${partialName}`)
    const content = fs.readFileSync(file.absPath, 'utf-8')
    hb.registerPartial(partialName, content)
  }

  for (const file of templates) {
    console.log(`Building template ${path.join(file.relDir, file.baseName)}`)
    await buildTemplateFile(outputDir, file, hb)
  }

  for (const file of other) {
    console.log(`Writing other file ${path.join(file.relDir, file.baseName)}`)
    const data = fs.readFileSync(file.absPath)
    await writeFileToOutputDir(outputDir, file, data)
  }
}

export async function buildLocalDir () {
  await buildAllFiles(__dirname)
}
