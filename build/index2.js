import Handlebars from 'handlebars';
import path from 'path';
const dirName = './src/';
const fileName = '/Users/jarred/Documents/random-test-thing/src/js/test.js'; // 'index.html'
const absPath = path.resolve(fileName);
const absDir = path.dirname(absPath);
const relDir = absDir.replace(path.resolve(dirName), '');
const ext = path.extname(fileName);
const fullName = path.basename(fileName);
const baseName = fullName.replace(ext, '');
const output = {
    absPath,
    absDir,
    relDir,
    fullName,
    ext,
    baseName
};
console.log(output);
console.log(path.join('', 'foobar'));
const hb = Handlebars.create();
let tempString = '<h1>{{> "myPartial" a="hello" b="hola" }}</h1>';
hb.registerPartial('myPartial', '<h2>{{ a }} - {{ b }}</h2>');
let template = hb.compile(tempString);
let outputHtml = template({});
console.log(outputHtml);
const hb2 = Handlebars.create();
hb2.registerPartial('myPartial', '<h2>{{ a }} - {{ b }}</h2>');
hb2.registerPartial('/path/to/myPartial2', '<h3>{{ c }}</h3>');
tempString = tempString + '<h2>{{> "/path/to/myPartial2" c="1234" }}</h2>';
template = hb2.compile(tempString);
outputHtml = template({});
console.log(outputHtml);
hb.registerPartial('/path/to/myPartial2', '<h3>{{ c }}</h3>');
template = hb.compile(tempString);
outputHtml = template({});
console.log(outputHtml);
hb.registerPartial('/path/to/myPartial2', '<h3>{{ c }} foobar</h3>');
template = hb.compile(tempString);
outputHtml = template({});
console.log(outputHtml);
const regex = /{{> "?([a-zA-Z\\/0-9-]+)"?.*?}}/g;
const outputMatch = tempString.matchAll(regex);
for (const m of outputMatch) {
    console.log(m);
}
