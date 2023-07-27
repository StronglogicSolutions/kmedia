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
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
function post_generated_text(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const strings = (0, util_1.FormatLongPost)(text);
        const items = [];
        const caption = (text.length > 2200) ? text.substring(0, 2200) : text;
        const num = (strings.length < 10) ? strings.length : 10;
        for (let i = 0; i < num; i++)
            items.push({ file: yield (0, util_1.ReadFile)(yield (0, util_1.CreateImage)(strings[i], `page${i + 1}.jpg`)), width: 1080, height: 1080 });
        return (items.length > 0 && items[0]);
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.argv.length < 3)
            throw new Error("You must pass text as a runtime parameter");
        const text = process.argv[2];
        yield post_generated_text(text);
    });
}
run();
//# sourceMappingURL=index.js.map