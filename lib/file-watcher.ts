import chokidar from 'chokidar';
import {lstatSync} from 'fs';
import path from 'path';
import {buildAllFiles, BuildData, buildFile} from './build-utils-two.js';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const dirName = '/Users/gla9931/Documents/test-html/vanilla-js-math/'
const srcDirName = path.join(dirName, 'src')
const outputDirName = path.join(dirName, 'output')

const buildData: BuildData = {
  templateFilesByPartial: {}
}

buildAllFiles(srcDirName, outputDirName, buildData)

const queue: string[] = []

chokidar.watch(srcDirName, {ignoreInitial: true}).on('all', (event, eventPath) => {
  console.log(event, eventPath)
  if (lstatSync(eventPath).isFile()) {
    queue.push(eventPath)
  }
});

async function watchQueue() {
  while (true) {
    if (queue.length === 0) {
      //console.log('Nothing in the queue, waiting...')
      await delay(100)
    } else {
      const file = queue.shift()

      if (file) {
        console.log('Found something in the queue: ', file)
        buildFile(file, srcDirName, outputDirName, buildData)
        console.log('Done working on queue')
      }
    }
  }
}

watchQueue()