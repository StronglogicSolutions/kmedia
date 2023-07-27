"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetExtent = exports.FindBestSize = exports.make_caption_command = exports.validate_aspect_ratio = exports.image_type = void 0;
//----------------------------------
var image_type;
(function (image_type) {
    image_type[image_type["square"] = 0] = "square";
    image_type[image_type["portrait"] = 1] = "portrait";
    image_type[image_type["landscape"] = 2] = "landscape";
})(image_type || (exports.image_type = image_type = {}));
//---------------------------------
const validate_aspect_ratio = (ratio) => {
    return ((ratio.x == 9 && ratio.y == 16) || // 9:16
        (ratio.x == 4 && ratio.y == 5) || // 4:5
        (ratio.x == 1 && ratio.y == 1)); // 1:1
};
exports.validate_aspect_ratio = validate_aspect_ratio;
//-------------------------------
// ~ 650 character limit @ 24pt
const make_caption_command = (text, file) => // size should be 1058.8235
 {
    const size = (text.length > 400) ? 24 : (text.length > 250) ? 28 : 48;
    const swdt = (text.length < 300) ? 0.5 : 0.15;
    return `convert -size "1058x1058" -background "#1E1E1E" -fill "#DFDFDF" -font "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf" -interword-spacing 4 -kerning 4 -pointsize ${size} -border 2%x2% -bordercolor "#1E1E1E" -gravity Center -interline-spacing 24 -stroke "#FEFEFE" -strokewidth ${swdt} caption:\"${text}\" ${file}`;
};
exports.make_caption_command = make_caption_command;
//----------------------------------
function FindBestSize(size) {
    const θ = 1; // Coefficient to optionally shrink images with imperfect aspect ratios
    if (size.height === size.width) // SQUARE
        return { type: image_type.square, size: { width: 1080, height: 1080 } };
    else if (size.height > size.width) {
        if ((1080 / size.width) < (1350 / size.height)) // PORTRAIT
            return { type: image_type.portrait, size: { width: 1080 * θ, height: null } };
        else
            return { type: image_type.portrait, size: { width: null, height: 1350 * θ } };
    }
    if ((1080 / size.width) < (566 / size.height)) // LANDSCAPE
        return { type: image_type.landscape, size: { width: 1080 * θ, height: null } };
    else
        return { type: image_type.landscape, size: { width: null, height: 566 * θ } };
}
exports.FindBestSize = FindBestSize;
//----------------------------------
function GetExtent(type) {
    switch (type) {
        case image_type.square: return { width: 1080, height: 1080 };
        case image_type.portrait: return { width: 1080, height: 1350 };
        case image_type.landscape: return { width: 1080, height: 566 };
    }
}
exports.GetExtent = GetExtent;
//# sourceMappingURL=gfx.js.map