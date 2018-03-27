var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var file_util_1 = require("./file-util");
var fs = require("fs");
var path = require("path");
function migrate() {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, json, originDataPath, commonAsyncDataPath, newRetCode200Folder, retCode200URLs, newUrl200Path, newURL200DataPath, newContent, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = path.resolve(process.cwd(), 'jmockr.config.json');
                    if (!fs.existsSync(filePath)) {
                        console.error("Can't find config file [" + filePath + "]");
                        throw new Error("Can't find config file [" + filePath + "]");
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    json = file_util_1.json5Require(filePath);
                    json.templateType = 'freemarker';
                    json.templateRoot = json.ftlFilePath;
                    originDataPath = json.dataPath;
                    if (!fs.existsSync(originDataPath.ajax)) {
                        throw new Error('ajax folder not found');
                    }
                    commonAsyncDataPath = originDataPath.ajax + '_migrate-common';
                    newRetCode200Folder = path.resolve(commonAsyncDataPath, 'retCode200');
                    if (!fs.existsSync(commonAsyncDataPath)) {
                        fs.mkdirSync(commonAsyncDataPath);
                    }
                    if (!fs.existsSync(newRetCode200Folder)) {
                        fs.mkdirSync(newRetCode200Folder);
                    }
                    retCode200URLs = fs.readFileSync(originDataPath.url200, { encoding: 'utf8' });
                    newUrl200Path = path.resolve(newRetCode200Folder, "url.json5");
                    return [4, file_util_1.makeFile({
                            mode: 'w',
                            path: newUrl200Path,
                            content: retCode200URLs
                        })];
                case 2:
                    _a.sent();
                    newURL200DataPath = path.resolve(newRetCode200Folder, 'data.json5');
                    return [4, file_util_1.makeFile({
                            mode: 'w',
                            path: newURL200DataPath,
                            content: JSON.stringify({ retCode: 200 }, null, 4)
                        })];
                case 3:
                    _a.sent();
                    json.dataPath = {
                        urlMap: originDataPath.urlMap,
                        commonSync: originDataPath.commonFtl,
                        commonAsync: commonAsyncDataPath,
                        pageSync: originDataPath.pageFtl,
                        pageAsync: originDataPath.ajax
                    };
                    json.authConfig.casDomain = '';
                    delete json.ftlFilePath;
                    newContent = JSON.stringify(json, null, 4);
                    fs.writeFileSync(filePath, newContent);
                    console.info("url200 file is moved to " + newRetCode200Folder);
                    process.exit(0);
                    return [3, 5];
                case 4:
                    e_1 = _a.sent();
                    throw e_1;
                case 5: return [2];
            }
        });
    });
}
exports.migrate = migrate;
//# sourceMappingURL=migrate.js.map