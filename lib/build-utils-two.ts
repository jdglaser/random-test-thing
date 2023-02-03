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

export interface BuildData {
  templateFilesByPartial: Record<string, string[]>
}

function buildFileObj(filePath: string, inputDir: string): File {
  const absPath = path.resolve(filePath)
  const absDir = path.dirname(absPath)
  const relDir = absDir.replace(inputDir, '')
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

function isPartial(fileName: string) {
  return path.extname(fileName) === '.hbs'
}

function getPartialName(file: File) {
  return path.join(file.relDir, file.baseName)
}

async function* walkFiles(dirName: string, ignorePartials = false): AsyncGenerator<string, void, void> {
  for await (const d of await fs.promises.opendir(dirName)) {
    const entry = path.join(dirName, d.name)
    const ignoreFile = isPartial(entry) && ignorePartials
    if (d.isDirectory()) yield* walkFiles(entry, ignorePartials)
    else if (d.isFile() && !ignoreFile) yield entry
  }
}

async function* getPartialFiles(dirName: string): AsyncGenerator<string, void, void> {
  for await (const file of walkFiles(dirName)) {
    if (isPartial(file)) yield file
  }
}

function getPartialsFromContent(content: string) {
  const regex = /{{> "?([a-zA-Z\\/0-9-]+)"?.*?}}/g
  const matches = content.matchAll(regex)

  const partials: string[] = []
  for (const match of matches) {
    const partialName = match[1]
    partials.push(partialName)
  }

  return partials
}

async function writeFileToOutputDir(outputDir: string, file: File, data?: string) {
  const outputFilePath = path.join(outputDir, file.relDir, file.fileName)
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

async function buildTemplateFile(outputDir: string, file: File, buildData: BuildData) {
  const {templateFilesByPartial} = buildData;
  const fileData = await fs.promises.readFile(file.absPath, 'utf-8')
  const partialsInTemplate = getPartialsFromContent(fileData)
  for (const partial of partialsInTemplate) {
    if (!templateFilesByPartial[partial]) {
      templateFilesByPartial[partial] = [] as string[]
    }

    if (!templateFilesByPartial[partial].includes(file.absPath)) {
      templateFilesByPartial[partial].push(file.absPath)
    }
  }
  const template = Handlebars.compile(fileData)
  const data = template(JSON.stringify({title: file.baseName}))
  writeFileToOutputDir(outputDir, file, data)
}

function registerPartial(file: File, buildData: BuildData): string {
  const {templateFilesByPartial} = buildData;
  const partialName = getPartialName(file)
  const content = fs.readFileSync(file.absPath, 'utf-8')
  const partialsInPartial = getPartialsFromContent(content)
  for (const partial of partialsInPartial) {
    if (!templateFilesByPartial[partial]) {
      templateFilesByPartial[partial] = [] as string[]
    }

    if (!templateFilesByPartial[partial].includes(file.absPath)) {
      templateFilesByPartial[partial].push(file.absPath)
    }
  }
  Handlebars.registerPartial(partialName, content)
  return partialName
}

export async function buildFile(filePath: string, inputDir: string, outputDir: string, buildData: BuildData) {
  console.log(buildData)
  const fileObj = buildFileObj(filePath, inputDir)
  const relPathName = path.join(fileObj.relDir, fileObj.fileName)
  const {templateFilesByPartial} = buildData;
  switch (fileObj.ext) {
    case '.html':
      console.log('Building template file', relPathName)
      await buildTemplateFile(outputDir, fileObj, buildData)
      break
    case '.hbs':
      console.log('Registering partial', relPathName)
      const partialName = registerPartial(fileObj, buildData)
      if (templateFilesByPartial[partialName]) {
        for (const file of templateFilesByPartial[partialName]) {
          console.log('FILE: ', file)
          await buildFile(file, inputDir, outputDir, buildData)
        }
      }
      break
    default:
      console.log('Writing file', relPathName)
      await writeFileToOutputDir(outputDir, fileObj)
  }
}

export async function buildAllFiles(inputDir: string, outputDir: string, buildData: BuildData) {
  console.log('Building all files in dirPath:', inputDir)

  for await (const partialFile of getPartialFiles(inputDir)) {
    await buildFile(partialFile, inputDir, outputDir, buildData)
    console.log('BUILD DATA:', buildData)
  }
  
  for await (const filePath of walkFiles(inputDir, true)) {
    await buildFile(filePath, inputDir, outputDir, buildData)
    console.log('BUILD DATA:', buildData)
  }
}
