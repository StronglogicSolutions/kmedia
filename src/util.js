"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatLongPost = exports.CreateImage = exports.FormatImage = exports.IGImageFromURL = exports.GetImageSize = exports.ReadFile = exports.IsVideo = exports.GetMime = exports.FormatVideo = exports.FetchFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { Readable } = require('stream');
const { finished } = require('stream/promises');
const ffmpeg_1 = __importDefault(require("ffmpeg"));
const lite_1 = __importDefault(require("mime/lite"));
const gm_1 = __importDefault(require("gm"));
const child_process_1 = require("child_process");
const gfx_1 = require("./gfx");
//---------------------------------
//----------INIT-------------------
//---------------------------------
gm_1.default.subClass({ imageMagick: true });
//---------------------------------
//----------CONSTANTS--------------
//---------------------------------
const center = "Center";
const nib_size = 400;
const not_found = -1;
const fail_result = { text: "", indexes: [], url: "" };
//---------------------------------
//----------SMOL-------------------
//---------------------------------
const sanitize = (s) => s.replace(/\.\.\.\//g, '').replace(/\.\.\//g, '').replace(/\"/g, '\\"');
//---------------------------------
//---------MAIN UTILS--------------
//---------------------------------
function FetchFile(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.info("Fetching file");
        if (url) {
            try {
                const ext = url.substring(url.lastIndexOf('.'));
                const dl_path = path_1.default.resolve(__dirname, 'temp' + ext);
                const response = yield fetch(url);
                if (response.ok) {
                    yield finished(Readable.fromWeb(response.body).pipe(fs_1.default.createWriteStream(dl_path)));
                    return dl_path;
                }
                console.error("Fetch error");
            }
            catch (e) {
                console.error({ FetchException: e, message: "Check version of node" });
            }
        }
        return "";
    });
}
exports.FetchFile = FetchFile;
//---------------------------------
function FormatVideo(file, make_preview = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const file_path = path_1.default.resolve(__dirname, file);
        if (!fs_1.default.existsSync(file_path))
            throw new Error("File path doesn't exist!!!");
        const video = yield new ffmpeg_1.default(file_path);
        if (video) {
            if (!(0, gfx_1.validate_aspect_ratio)(video.metadata.video.aspect))
                video.setVideoSize('1080x1350', true, true, '#fff');
            else
                video.setVideoSize('1080x?', true, true);
            if (make_preview)
                video.fnExtractFrameToJPG(path_1.default.resolve(__dirname, '..'), { frame_rate: 1,
                    number: 1,
                    file_name: 'preview.jpg' });
            video.save(path_1.default.resolve(__dirname, '..', 'formatted.mp4'), (err, new_file) => {
                if (!err) {
                    console.info({ new_file });
                    return true;
                }
                console.error(err);
            });
        }
        return false;
    });
}
exports.FormatVideo = FormatVideo;
//----------------------------------
function GetMime(path) {
    return lite_1.default.getType(path);
}
exports.GetMime = GetMime;
//----------------------------------
function IsVideo(mime) {
    return mime.includes('video');
}
exports.IsVideo = IsVideo;
//----------------------------------
function ReadFile(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        let resolver;
        let p1 = new Promise(resolve => resolver = resolve);
        let p2 = new Promise(resolve => setTimeout(() => { }, 8000));
        let buffer = undefined;
        yield fs_1.default.readFile(filepath, (err, data) => {
            if (err)
                console.error('Failed to read file');
            else
                buffer = data;
            resolver();
        });
        yield Promise.race([p1, p2]);
        return buffer;
    });
}
exports.ReadFile = ReadFile;
//----------------------------------
function GetImageSize(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = (0, gm_1.default)(file);
        return new Promise(r => image.size((err, info) => r({ width: info.width, height: info.height })));
    });
}
exports.GetImageSize = GetImageSize;
//----------------------------------
function IGImageFromURL(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = yield FormatImage(yield FetchFile(url));
        const size = yield GetImageSize(image);
        return { file: yield ReadFile(image), width: size.width, height: size.height };
    });
}
exports.IGImageFromURL = IGImageFromURL;
//----------------------------------
function FormatImage(file, out = 'temp.jpg') {
    return __awaiter(this, void 0, void 0, function* () {
        let r = undefined;
        let path = file;
        const p = new Promise(resolve => r = resolve);
        const data = (0, gm_1.default)(file);
        const mime_data = GetMime(file);
        const orig_size = yield GetImageSize(file);
        const style = (0, gfx_1.FindBestSize)(orig_size);
        const size = style.size;
        const extent = (0, gfx_1.GetExtent)(style.type);
        console.info({ BestSize: size });
        if (mime_data.includes('png')) {
            console.info({ SaveAs: out, Reminder: 'IG images must be jpg' });
            path = file.substring(0, file.lastIndexOf('/') + 1) + out;
        }
        data.resize(size.width, size.height).background('black').gravity(center).extent(extent.width, extent.height).write(path, (err) => {
            if (err)
                console.error({ Error: "Error formatting image", Message: err });
            else {
                console.info("Image formatting complete");
                file = path;
            }
            r();
        });
        yield p;
        return file;
    });
}
exports.FormatImage = FormatImage;
//----------------------------------
function CreateImage(text, name = "generated.png") {
    return __awaiter(this, void 0, void 0, function* () {
        let r = undefined;
        const p = new Promise(resolve => r = resolve);
        (0, child_process_1.exec)((0, gfx_1.make_caption_command)(text, name), (error, stdout, stderr) => {
            if (error)
                console.error(Object.assign(Object.assign({}, error), { message: error.message.substring(0, 250) }));
            else if (stderr)
                console.error(stderr);
            r();
        });
        yield p;
        return name;
    });
}
exports.CreateImage = CreateImage;
//----------------------------------
function FormatLongPost(input, clean_text = false) {
    const chunks = [];
    const text = (clean_text) ? sanitize(input) : input;
    for (let i = 0, read = 0; read < text.length;) {
        const size = ((text.length - read) > nib_size) ? nib_size : (text.length - read);
        let chunk = text.substring(read, (read + size));
        if ((read + size) === text.length) {
            if (size < 8)
                chunks[chunks.length - 1] += chunk;
            else
                chunks.push(chunk);
            break;
        }
        const w_id = chunk.lastIndexOf(' ');
        const p_id = chunk.lastIndexOf('.');
        const pos = (i + size < text.length) ?
            (w_id > p_id) ? w_id : p_id :
            size;
        chunks.push((pos === 0) ? chunk : chunk.substring(0, pos));
        i++;
        read += pos;
    }
    console.trace({ FormatFinish: `${chunks.length} chunks` });
    return chunks;
}
exports.FormatLongPost = FormatLongPost;
//# sourceMappingURL=util.js.map