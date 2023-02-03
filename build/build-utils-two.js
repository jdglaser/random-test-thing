var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
import fs from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
function buildFileObj(filePath, dirName) {
    const absPath = path.resolve(filePath);
    const absDir = path.dirname(absPath);
    const relDir = absDir.replace(dirName, '');
    const ext = path.extname(absPath);
    const fullName = path.basename(absPath);
    const baseName = fullName.replace(ext, '');
    return {
        absPath,
        absDir,
        relDir,
        fileName: fullName,
        ext,
        baseName
    };
}
export function walkFiles(dirName) {
    return __asyncGenerator(this, arguments, function* walkFiles_1() {
        var _a, e_1, _b, _c;
        try {
            for (var _d = true, _e = __asyncValues(yield __await(fs.promises.opendir(dirName))), _f; _f = yield __await(_e.next()), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const d = _c;
                    const entry = path.join(dirName, d.name);
                    if (d.isDirectory())
                        yield __await(yield* __asyncDelegator(__asyncValues(walkFiles(entry))));
                    else if (d.isFile())
                        yield yield __await(entry);
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield __await(_b.call(_e));
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
export function getAllFiles(dirName) {
    var _a, e_2, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const allFiles = {
            templates: [],
            partials: [],
            other: []
        };
        try {
            for (var _d = true, _e = __asyncValues(walkFiles(dirName)), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const file = _c;
                    const fileObj = buildFileObj(file, dirName);
                    switch (fileObj.ext) {
                        case '.html':
                            allFiles.templates.push(fileObj);
                            break;
                        case '.hbs':
                            allFiles.partials.push(fileObj);
                            break;
                        default:
                            allFiles.other.push(fileObj);
                    }
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return allFiles;
    });
}
export function getPartialsFromContent(content, outputDirName) {
    return __awaiter(this, void 0, void 0, function* () {
        const regex = /{{> "?([a-zA-Z\\/0-9-]+)"?.*?}}/g;
        const matches = content.matchAll(regex);
        const partials = [];
        for (const match of matches) {
            const partialName = match[1];
            const pathToPartial = path.join(outputDirName, partialName, '.hbs');
            partials.push({
                name: match[1],
                path: pathToPartial
            });
        }
    });
}
function writeFileToOutputDir(outputDir, file, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const outputFilePath = path.join(outputDir, file.relDir, file.fileName);
        const outputDirPath = path.dirname(outputFilePath);
        if (!fs.existsSync(outputDirPath)) {
            yield fs.promises.mkdir(outputDirPath);
        }
        if (!data) {
            const readData = fs.readFileSync(file.absPath);
            fs.writeFileSync(outputFilePath, readData);
            return;
        }
        fs.writeFileSync(outputFilePath, data);
    });
}
function buildTemplateFile(outputDir, file) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileData = yield fs.promises.readFile(file.absPath, 'utf-8');
        const template = Handlebars.compile(fileData);
        const data = template(JSON.stringify({ title: file.baseName }));
        writeFileToOutputDir(outputDir, file, data);
    });
}
function registerPartial(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const partialName = `${path.join(file.relDir, file.baseName)}`;
        console.log(`Registering partial ${partialName}`);
        const content = fs.readFileSync(file.absPath, 'utf-8');
        Handlebars.registerPartial(partialName, content);
    });
}
export function buildFile(filePath, dirName) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileObj = buildFileObj(filePath, dirName);
        const outputDir = path.join(dirName, 'output');
        const relPathName = path.join(fileObj.relDir, fileObj.baseName, fileObj.ext);
        switch (fileObj.ext) {
            case '.html':
                console.log('Building template file', relPathName);
                buildTemplateFile(outputDir, fileObj);
                break;
            case '.hbs':
                console.log('Registering partial', relPathName);
                registerPartial(fileObj);
                break;
            default:
                console.log('Writing file', relPathName);
                yield writeFileToOutputDir(outputDir, fileObj);
        }
    });
}
export function buildAllFiles(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const inputDir = path.join(dirPath, 'src');
        const { templates, partials, other } = yield getAllFiles(inputDir);
        for (const file of [...templates, ...partials, ...other]) {
            buildFile(file.absPath, dirPath);
        }
    });
}
