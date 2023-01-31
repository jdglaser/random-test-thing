import fs from 'fs'
import path from 'path'
import handlebars from 'handlebars'

const sourceDir = './src'
const outputDir = './output'

const buildHtml = (html) => {
  const template = handlebars.compile(html)
  const output = template({ title: 'A Cool Title' })
  return output
}

const walkDir = async (dir) => {
  const allFiles = []

  console.log('Walking directories')
  const walk = async (innerDir) => {
    const files = await fs.promises.readdir(innerDir)
    for (const file of files) {
      const absPath = path.join(innerDir, file)
      if ((await fs.promises.stat(absPath)).isDirectory()) {
        return walk(absPath)
      }
      allFiles.push(absPath)
    }
  }

  await walk(dir)
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

const build = async () => {
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

build()
