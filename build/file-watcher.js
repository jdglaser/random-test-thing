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
import { lstatSync } from 'fs';
import path from 'path';
import { buildAllFiles, buildFile } from './build-utils-two.js';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const dirName = '/Users/gla9931/Documents/test-html/vanilla-js-math/';
const srcDirName = path.join(dirName, 'src');
const outputDirName = path.join(dirName, 'output');
const buildData = {
    templateFilesByPartial: {}
};
buildAllFiles(srcDirName, outputDirName, buildData);
const queue = [];
chokidar.watch(srcDirName, { ignoreInitial: true }).on('all', (event, eventPath) => {
    console.log(event, eventPath);
    if (lstatSync(eventPath).isFile()) {
        queue.push(eventPath);
    }
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
                    buildFile(file, srcDirName, outputDirName, buildData);
                    console.log('Done working on queue');
                }
            }
        }
    });
}
watchQueue();
