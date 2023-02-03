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
function buildFileObj(filePath, inputDir) {
    const absPath = path.resolve(filePath);
    const absDir = path.dirname(absPath);
    const relDir = absDir.replace(inputDir, '');
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
function isPartial(fileName) {
    return path.extname(fileName) === '.hbs';
}
function getPartialName(file) {
    return path.join(file.relDir, file.baseName);
}
function walkFiles(dirName, ignorePartials = false) {
    return __asyncGenerator(this, arguments, function* walkFiles_1() {
        var e_1, _a;
        try {
            for (var _b = __asyncValues(yield __await(fs.promises.opendir(dirName))), _c; _c = yield __await(_b.next()), !_c.done;) {
                const d = _c.value;
                const entry = path.join(dirName, d.name);
                const ignoreFile = isPartial(entry) && ignorePartials;
                if (d.isDirectory())
                    yield __await(yield* __asyncDelegator(__asyncValues(walkFiles(entry, ignorePartials))));
                else if (d.isFile() && !ignoreFile)
                    yield yield __await(entry);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
function getPartialFiles(dirName) {
    return __asyncGenerator(this, arguments, function* getPartialFiles_1() {
        var e_2, _a;
        try {
            for (var _b = __asyncValues(walkFiles(dirName)), _c; _c = yield __await(_b.next()), !_c.done;) {
                const file = _c.value;
                if (isPartial(file))
                    yield yield __await(file);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield __await(_a.call(_b));
            }
            finally { if (e_2) throw e_2.error; }
        }
    });
}
function getPartialsFromContent(content) {
    const regex = /{{> "?([a-zA-Z\\/0-9-]+)"?.*?}}/g;
    const matches = content.matchAll(regex);
    const partials = [];
    for (const match of matches) {
        const partialName = match[1];
        partials.push(partialName);
    }
    return partials;
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
function buildTemplateFile(outputDir, file, buildData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { templateFilesByPartial } = buildData;
        const fileData = yield fs.promises.readFile(file.absPath, 'utf-8');
        const partialsInTemplate = getPartialsFromContent(fileData);
        for (const partial of partialsInTemplate) {
            if (!templateFilesByPartial[partial]) {
                templateFilesByPartial[partial] = [];
            }
            if (!templateFilesByPartial[partial].includes(file.absPath)) {
                templateFilesByPartial[partial].push(file.absPath);
            }
        }
        const template = Handlebars.compile(fileData);
        const data = template(JSON.stringify({ title: file.baseName }));
        writeFileToOutputDir(outputDir, file, data);
    });
}
function registerPartial(file, buildData) {
    const { templateFilesByPartial } = buildData;
    const partialName = getPartialName(file);
    const content = fs.readFileSync(file.absPath, 'utf-8');
    const partialsInPartial = getPartialsFromContent(content);
    for (const partial of partialsInPartial) {
        if (!templateFilesByPartial[partial]) {
            templateFilesByPartial[partial] = [];
        }
        if (!templateFilesByPartial[partial].includes(file.absPath)) {
            templateFilesByPartial[partial].push(file.absPath);
        }
    }
    Handlebars.registerPartial(partialName, content);
    return partialName;
}
export function buildFile(filePath, inputDir, outputDir, buildData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(buildData);
        const fileObj = buildFileObj(filePath, inputDir);
        const relPathName = path.join(fileObj.relDir, fileObj.fileName);
        const { templateFilesByPartial } = buildData;
        switch (fileObj.ext) {
            case '.html':
                console.log('Building template file', relPathName);
                yield buildTemplateFile(outputDir, fileObj, buildData);
                break;
            case '.hbs':
                console.log('Registering partial', relPathName);
                const partialName = registerPartial(fileObj, buildData);
                if (templateFilesByPartial[partialName]) {
                    for (const file of templateFilesByPartial[partialName]) {
                        console.log('FILE: ', file);
                        yield buildFile(file, inputDir, outputDir, buildData);
                    }
                }
                break;
            default:
                console.log('Writing file', relPathName);
                yield writeFileToOutputDir(outputDir, fileObj);
        }
    });
}
export function buildAllFiles(inputDir, outputDir, buildData) {
    var e_3, _a, e_4, _b;
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Building all files in dirPath:', inputDir);
        try {
            for (var _c = __asyncValues(getPartialFiles(inputDir)), _d; _d = yield _c.next(), !_d.done;) {
                const partialFile = _d.value;
                yield buildFile(partialFile, inputDir, outputDir, buildData);
                console.log('BUILD DATA:', buildData);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) yield _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        try {
            for (var _e = __asyncValues(walkFiles(inputDir, true)), _f; _f = yield _e.next(), !_f.done;) {
                const filePath = _f.value;
                yield buildFile(filePath, inputDir, outputDir, buildData);
                console.log('BUILD DATA:', buildData);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_4) throw e_4.error; }
        }
    });
}
