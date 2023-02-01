import fs from 'fs'
import handlebars from 'handlebars'
import path from 'path'

const sourceDir = './src'
const outputDir = './output'

const buildHtml = (html) => {
  const template = handlebars.compile(html)
  const output = template({ title: 'A Cool Title' })
  return output
}

async function * walk (dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name)
    if (d.isDirectory()) yield * walk(entry)
    else if (d.isFile()) yield entry
  }
}

const walkDir = async (dir) => {
  const allFiles = []

  console.log('Walking directories')
  for await (const file of walk(dir)) {
    if (path.extname(file) === '.hbs') {
      console.log('FOUND HBS: ', file)
      const template = fs.readFileSync(file, 'utf-8')
      handlebars.registerPartial(file, template)
    } else {
      allFiles.push(file)
    }
  }

  return allFiles
}

const buildFile = async (file) => {
  console.log(`Building file ${file}`)
  const absSourceDir = path.resolve(sourceDir)
  const absOutputDir = path.resolve(outputDir)
  const absFilePath = path.resolve(file)
  const fileBasePath = absFilePath.replace(absSourceDir, '')
  const fileOutputPath = path.join(absOutputDir, fileBasePath)
  if (!fs.existsSync(path.dirname(fileOutputPath))) {
    await fs.promises.mkdir(path.dirname(fileOutputPath))
  }
  const fileData = await fs.promises.readFile(file, 'utf-8')
  const compiledHtml = buildHtml(fileData)
  await fs.promises.writeFile(fileOutputPath, compiledHtml)
}

const buildAll = async () => {
  const absSourceDir = path.resolve(sourceDir)
  const allFiles = await walkDir(absSourceDir)
  for (const file of allFiles) {
    await buildFile(file)
  }
}

export const build = async () => {
  const absOutputDir = path.resolve(outputDir)
  if (!fs.existsSync(absOutputDir)) {
    console.log(`Creating output directory ${absOutputDir}`)
    await fs.promises.mkdir(absOutputDir)
  }

  const args = process.argv
  const fileArg = args[2]

  if (fileArg) {
    buildFile(fileArg)
  } else {
    buildAll()
  }
}
