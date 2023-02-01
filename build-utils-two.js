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
  console.log(dirName)
  for await (const d of await fs.promises.opendir(dirName)) {
    console.log(d)
    const entry = path.join(dirName, d.name)
    if (d.isDirectory()) yield * walkFiles(entry)
    else if (d.isFile()) yield entry
  }
}

export async function getAllFiles (dirName) {
  console.log('Getting all files')
  const allFiles = [[], [], []]
  console.log('Here')
  for await (const file of walkFiles(dirName)) {
    console.log('Here2')
    console.log(file)
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

  console.log(allFiles)
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
  console.log('here')
  const outputFilePath = path.join(outputDir, file.relDir, file.fullName)
  console.log(outputFilePath)
  const outputDirPath = path.dirname(outputFilePath)
  console.log(outputDirPath)
  if (!fs.existsSync(outputDirPath)) {
    await fs.promises.mkdir(outputDirPath)
  }
  fs.writeFileSync(outputFilePath, content)
  console.log('done writing ', file.baseName)
}

async function buildTemplateFile (outputDir, file, hb) {
  const fileData = await fs.promises.readFile(file.absPath, 'utf-8')
  const template = hb.compile(fileData)
  const content = template(JSON.stringify({ title: file.baseName }))
  console.log(content)
  writeFileToOutputDir(outputDir, file, content)
}

export async function buildAllFiles (dirPath) {
  console.log('Starting')
  const hb = Handlebars.create()
  console.log('Created handlebars')
  const outputDir = path.join(dirPath, 'output')
  const inputDir = path.join(dirPath, 'src')

  const [templates, partials, other] = await getAllFiles(inputDir)
  for (const file of partials) {
    console.log(`Registering partial ${file.baseName}`)
    const content = fs.readFileSync(file.absPath, 'utf-8')
    console.log(content)
    console.log('Registering: ', path.join(file.relDir, file.baseName))
    hb.registerPartial(path.join(file.relDir, file.baseName), content)
  }

  for (const file of templates) {
    console.log(`Building template file ${file.baseName}`)
    await buildTemplateFile(outputDir, file, hb)
  }

  for (const file of other) {
    console.log(`Writing other file ${file.baseName}`)
    const data = fs.readFileSync(file.absPath)
    await writeFileToOutputDir(outputDir, file, data)
  }
}

await buildAllFiles(__dirname)
