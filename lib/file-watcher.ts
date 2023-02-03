import chokidar from 'chokidar';
import path from 'path';
import {buildAllFiles, buildFile} from './build-utils-two.js';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const dirName = '/Users/jarred/Documents/random-test-thing/'
const srcDir = path.join(dirName, 'src')

console.log('Building all files in', srcDir)
buildAllFiles(dirName)

const queue: string[] = []

chokidar.watch(srcDir, {ignoreInitial: true}).on('all', (event, path) => {
  console.log(event, path)
  queue.push(path)
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
        buildFile(file, dirName)
        console.log('Done working on queue')
      }
    }
  }
}

watchQueue()