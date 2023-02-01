import fs from 'fs'
import Handlebars from 'handlebars'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface File {
  absPath: string
  absDir: string
  relDir: string
  fileName: string
  baseName: string
  ext: string
}

interface Partial {
  name: string
  path: string
}

interface GetAllFileResponse {
  templates: File[]
  partials: File[]
  other: File[]
}

export async function * walkFiles (dirName: string): AsyncGenerator<string, void, void> {
  for await (const d of await fs.promises.opendir(dirName)) {
    const entry = path.join(dirName, d.name)
    if (d.isDirectory()) yield * walkFiles(entry)
    else if (d.isFile()) yield entry
  }
}

export async function getAllFiles (dirName: string) {
  const allFiles: GetAllFileResponse = {
    templates: [] as File[],
    partials: [] as File[],
    other: [] as File[]
  }

  for await (const file of walkFiles(dirName)) {
    const absDir = path.dirname(file)
    const relDir = absDir.replace(dirName, '')
    const ext = path.extname(file)
    const fullName = path.basename(file)
    const baseName = fullName.replace(ext, '')

    const fileObject: File = {
      absPath: file,
      absDir,
      relDir,
      fileName: fullName,
      ext,
      baseName
    }

    switch (ext) {
      case '.html':
        allFiles.templates.push(fileObject)
        break
      case '.hbs':
        allFiles.partials.push(fileObject)
        break
      default:
        allFiles.other.push(fileObject)
    }
  }

  return allFiles
}

export async function getPartialsFromContent (content: string, outputDirName: string) {
  const regex = /{{> "?([a-zA-Z\\/0-9-]+)"?.*?}}/g
  const matches = content.matchAll(regex)

  const partials: Partial[] = []
  for (const match of matches) {
    const partialName = match[1]
    const pathToPartial = path.join(outputDirName, partialName, '.hbs')
    partials.push({
      name: match[1],
      path: pathToPartial
    })
  }
}

async function writeFileToOutputDir (outputDir: string, file: File, content: string | Buffer) {
  const outputFilePath = path.join(outputDir, file.relDir, file.fileName)
  const outputDirPath = path.dirname(outputFilePath)
  if (!fs.existsSync(outputDirPath)) {
    await fs.promises.mkdir(outputDirPath)
  }
  fs.writeFileSync(outputFilePath, content)
}

async function buildTemplateFile (outputDir: string, file: File, hb: typeof Handlebars) {
  const fileData = await fs.promises.readFile(file.absPath, 'utf-8')
  const template = hb.compile(fileData)
  const content = template(JSON.stringify({ title: file.baseName }))
  writeFileToOutputDir(outputDir, file, content)
}

export async function buildAllFiles (dirPath: string) {
  const hb = Handlebars.create()
  const outputDir = path.join(dirPath, 'output')
  const inputDir = path.join(dirPath, 'src')

  const {templates, partials, other} = await getAllFiles(inputDir)
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
