var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chokidar from 'chokidar';
import path from 'path';
import { buildAllFiles, buildFile } from './build-utils-two.js';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const dirName = '/Users/jarred/Documents/random-test-thing/';
const srcDir = path.join(dirName, 'src');
console.log('Building all files in', srcDir);
buildAllFiles(dirName);
const queue = [];
chokidar.watch(srcDir, { ignoreInitial: true }).on('all', (event, path) => {
    console.log(event, path);
    queue.push(path);
});
function watchQueue() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            if (queue.length === 0) {
                //console.log('Nothing in the queue, waiting...')
                yield delay(100);
            }
            else {
                const file = queue.shift();
                if (file) {
                    console.log('Found something in the queue: ', file);
                    buildFile(file, dirName);
                    console.log('Done working on queue');
                }
            }
        }
    });
}
watchQueue();
