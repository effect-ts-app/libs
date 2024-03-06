"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.model = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const fs = __importStar(require("fs"));
function normalise(str) {
    try {
        return (0, generator_1.default)((0, parser_1.parse)(str, { sourceType: "module", plugins: ["typescript"] }))
            .code;
        // .replace(/'/g, `"`)
        // .replace(/\/index/g, "")
        // .replace(/([\n\s]+ \|)/g, " |").replaceAll(": |", ":")
        // .replaceAll(/[\s\n]+\|/g, " |")
        // .replaceAll("\n", ";")
        // .replaceAll(" ", "")
        // TODO: remove all \n and whitespace?
    }
    catch (e) {
        return str;
    }
}
const model = ({ meta }) => {
    try {
        const targetContent = fs.readFileSync(meta.filename).toString();
        const processed = [];
        const sourcePath = meta.filename;
        if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
            throw Error(`Source path is not a file: ${sourcePath}`);
        }
        const clss = targetContent.matchAll(/^export class (\w+)[^{]*(Extended(Tagged)?Class)|ExtendedTaggedRequest/g);
        const them = [];
        for (const cls of clss) {
            let modelName = null;
            if (cls && cls[1]) {
                modelName = cls[1];
            }
            else
                continue;
            if (processed.includes(modelName))
                continue;
            processed.push(modelName);
            them.push([
                `export namespace ${modelName} {`,
                `  export class From extends S.FromClass<typeof ${modelName}>() {}`,
                "}"
            ]);
        }
        const expectedContent = [
            "//",
            `/* eslint-disable */`,
            ...them.flat().filter((x) => !!x),
            `/* eslint-enable */`,
            "//"
        ]
            .join("\n");
        // do not re-emit in a different style, or a loop will occur
        if (normalise(meta.existingContent) === normalise(expectedContent)) {
            return meta.existingContent;
        }
        return expectedContent;
    }
    catch (e) {
        return ("/** Got exception: "
            + ("stack" in e ? e.stack : "")
            + JSON.stringify(e)
            + "*/");
    }
};
exports.model = model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJlc2V0cy9tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEQUF1RDtBQUN2RCxpRUFBdUM7QUFDdkMsMENBQXFDO0FBRXJDLHVDQUF3QjtBQUV4QixTQUFTLFNBQVMsQ0FBQyxHQUFXO0lBQzVCLElBQUksQ0FBQztRQUNILE9BQU8sSUFBQSxtQkFBUSxFQUNiLElBQUEsY0FBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBUSxDQUNyRTthQUNFLElBQUksQ0FBQTtRQUNQLHNCQUFzQjtRQUN0QiwyQkFBMkI7UUFDM0IseURBQXlEO1FBQ3pELGtDQUFrQztRQUNsQyx5QkFBeUI7UUFDekIsdUJBQXVCO1FBQ3ZCLHNDQUFzQztJQUN4QyxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1osQ0FBQztBQUNILENBQUM7QUFFTSxNQUFNLEtBQUssR0FFYixDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtJQUNoQixJQUFJLENBQUM7UUFDSCxNQUFNLGFBQWEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUUvRCxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUE7UUFFOUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUNoQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztZQUNwRSxNQUFNLEtBQUssQ0FBQyw4QkFBOEIsVUFBVSxFQUFFLENBQUMsQ0FBQTtRQUN6RCxDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyx5RUFBeUUsQ0FBQyxDQUFBO1FBQzlHLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNmLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7WUFDdkIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFBO1lBQ3BCLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNsQixTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3BCLENBQUM7O2dCQUFNLFNBQVE7WUFDZixJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO2dCQUFFLFNBQVE7WUFDM0MsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUV6QixJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNSLG9CQUFvQixTQUFTLElBQUk7Z0JBQ2pDLGtEQUFrRCxTQUFTLFFBQVE7Z0JBQ25FLEdBQUc7YUFDSixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsTUFBTSxlQUFlLEdBQUc7WUFDdEIsSUFBSTtZQUNKLHNCQUFzQjtZQUN0QixHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMscUJBQXFCO1lBQ3JCLElBQUk7U0FDTDthQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUViLDREQUE0RDtRQUM1RCxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssU0FBUyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7WUFDbkUsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFBO1FBQzdCLENBQUM7UUFDRCxPQUFPLGVBQWUsQ0FBQTtJQUN4QixDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FDTCxxQkFBcUI7Y0FDbkIsQ0FBQyxPQUFPLElBQUssQ0FBUyxDQUFDLENBQUMsQ0FBRSxDQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Y0FDL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Y0FDakIsSUFBSSxDQUNQLENBQUE7SUFDSCxDQUFDO0FBQ0gsQ0FBQyxDQUFBO0FBbkRZLFFBQUEsS0FBSyxTQW1EakIifQ==