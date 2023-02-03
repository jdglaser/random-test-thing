import fs from 'fs'
import Handlebars from 'handlebars'
import path from 'path'

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

function buildFileObj(filePath: string, dirName: string): File {
  console.log('DIR NAME: ', dirName)
  const absPath = path.resolve(filePath)
  const absDir = path.dirname(absPath)
  const relDir = absDir.replace(dirName, '')
  console.log('REL DIR:', relDir)
  const ext = path.extname(absPath)
  const fullName = path.basename(absPath)
  const baseName = fullName.replace(ext, '')

  return {
    absPath,
    absDir,
    relDir,
    fileName: fullName,
    ext,
    baseName
  }
}

export async function* walkFiles(dirName: string): AsyncGenerator<string, void, void> {
  for await (const d of await fs.promises.opendir(dirName)) {
    const entry = path.join(dirName, d.name)
    if (d.isDirectory()) yield* walkFiles(entry)
    else if (d.isFile()) yield entry
  }
}

export async function getAllFiles(dirName: string) {
  console.log('GET ALL FILES DIRNAME:', dirName)
  const allFiles: GetAllFileResponse = {
    templates: [] as File[],
    partials: [] as File[],
    other: [] as File[]
  }

  for await (const file of walkFiles(dirName)) {
    const fileObj = buildFileObj(file, dirName)

    switch (fileObj.ext) {
      case '.html':
        allFiles.templates.push(fileObj)
        break
      case '.hbs':
        allFiles.partials.push(fileObj)
        break
      default:
        allFiles.other.push(fileObj)
    }
  }

  return allFiles
}

export function getPartialsFromContent(content: string, outputDirName: string) {
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

async function writeFileToOutputDir(outputDir: string, file: File, data?: string) {
  const outputFilePath = path.join(outputDir, file.relDir, file.fileName)
  console.log(outputFilePath)
  const outputDirPath = path.dirname(outputFilePath)
  if (!fs.existsSync(outputDirPath)) {
    await fs.promises.mkdir(outputDirPath)
  }

  if (!data) {
    const readData = fs.readFileSync(file.absPath)
    fs.writeFileSync(outputFilePath, readData)
    return
  }

  fs.writeFileSync(outputFilePath, data)
}

async function buildTemplateFile(outputDir: string, file: File) {
  const fileData = await fs.promises.readFile(file.absPath, 'utf-8')
  const template = Handlebars.compile(fileData)
  const data = template(JSON.stringify({title: file.baseName}))
  writeFileToOutputDir(outputDir, file, data)
}

function registerPartial(file: File) {
  const partialName = path.join(file.relDir, file.fileName)
  console.log(`Registering partial ${partialName}`)
  const content = fs.readFileSync(file.absPath, 'utf-8')
  Handlebars.registerPartial(partialName, content)
}

export async function buildFile(filePath: string, dirName: string) {
  const fileObj = buildFileObj(filePath, dirName)
  const outputDir = path.join(dirName, 'output')
  const relPathName = path.join(fileObj.relDir, fileObj.baseName, fileObj.ext)
  switch (fileObj.ext) {
    case '.html':
      console.log('Building template file', relPathName)
      await buildTemplateFile(outputDir, fileObj)
      break
    case '.hbs':
      console.log('Registering partial', relPathName)
      registerPartial(fileObj)
      break
    default:
      console.log('Writing file', relPathName)
      await writeFileToOutputDir(outputDir, fileObj)
  }
}

export async function buildAllFiles(dirPath: string) {
  console.log('Building all files in dirPath:', dirPath)
  const inputDir = path.join(dirPath, 'src')

  const {templates, partials, other} = await getAllFiles(inputDir)
  for (const file of [...templates, ...partials, ...other]) {
    buildFile(file.absPath, dirPath)
  }
}
