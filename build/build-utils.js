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
import handlebars from 'handlebars';
import path from 'path';
const sourceDir = './src';
const outputDir = './output';
const buildHtml = (html) => {
    const template = handlebars.compile(html);
    const output = template({ title: 'A Cool Title' });
    return output;
};
function walk(dir) {
    return __asyncGenerator(this, arguments, function* walk_1() {
        var e_1, _a;
        try {
            for (var _b = __asyncValues(yield __await(fs.promises.opendir(dir))), _c; _c = yield __await(_b.next()), !_c.done;) {
                const d = _c.value;
                const entry = path.join(dir, d.name);
                if (d.isDirectory())
                    yield __await(yield* __asyncDelegator(__asyncValues(walk(entry))));
                else if (d.isFile())
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
const walkDir = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    var e_2, _a;
    const allFiles = [];
    console.log('Walking directories');
    try {
        for (var _b = __asyncValues(walk(dir)), _c; _c = yield _b.next(), !_c.done;) {
            const file = _c.value;
            if (path.extname(file) === '.hbs') {
                console.log('FOUND HBS: ', file);
                const template = fs.readFileSync(file, 'utf-8');
                handlebars.registerPartial(file, template);
            }
            else {
                allFiles.push(file);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return allFiles;
});
const buildFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Building file ${file}`);
    const absSourceDir = path.resolve(sourceDir);
    const absOutputDir = path.resolve(outputDir);
    const absFilePath = path.resolve(file);
    const fileBasePath = absFilePath.replace(absSourceDir, '');
    const fileOutputPath = path.join(absOutputDir, fileBasePath);
    if (!fs.existsSync(path.dirname(fileOutputPath))) {
        yield fs.promises.mkdir(path.dirname(fileOutputPath));
    }
    const fileData = yield fs.promises.readFile(file, 'utf-8');
    const compiledHtml = buildHtml(fileData);
    yield fs.promises.writeFile(fileOutputPath, compiledHtml);
});
const buildAll = () => __awaiter(void 0, void 0, void 0, function* () {
    const absSourceDir = path.resolve(sourceDir);
    const allFiles = yield walkDir(absSourceDir);
    for (const file of allFiles) {
        yield buildFile(file);
    }
});
export const build = () => __awaiter(void 0, void 0, void 0, function* () {
    const absOutputDir = path.resolve(outputDir);
    if (!fs.existsSync(absOutputDir)) {
        console.log(`Creating output directory ${absOutputDir}`);
        yield fs.promises.mkdir(absOutputDir);
    }
    const args = process.argv;
    const fileArg = args[2];
    if (fileArg) {
        buildFile(fileArg);
    }
    else {
        buildAll();
    }
});
