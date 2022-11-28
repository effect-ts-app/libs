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
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const fs = __importStar(require("fs"));
const compiler_1 = require("../compiler");
function normalise(str) {
    try {
        return (0, generator_1.default)((0, parser_1.parse)(str, { sourceType: "module", plugins: ["typescript"] }))
            .code;
        // .replace(/'/g, `"`)
        // .replace(/\/index/g, "")
        //.replace(/([\n\s]+ \|)/g, " |").replaceAll(": |", ":")
        //.replaceAll(/[\s\n]+\|/g, " |")
        //.replaceAll("\n", ";")
        //.replaceAll(" ", "")
        // TODO: remove all \n and whitespace?
    }
    catch (e) {
        return str;
    }
}
// TODO: get shared compiler host...
const utils_1 = require("@typescript-eslint/utils");
const model = ({ meta }, context) => {
    if (!context.parserOptions.project) {
        console.warn(`${meta.filename}: Cannot run ESLint Model plugin, because no TS Compiler is enabled`);
        return meta.existingContent;
    }
    try {
        // option to exclude some methods
        //const exclude = (options.exclude || "").split(",")
        // checks and reads the file
        const sourcePath = meta.filename;
        if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
            throw Error(`Source path is not a file: ${sourcePath}`);
        }
        // const cfgFile = ts.findConfigFile(sourcePath, (fn) => fs.existsSync(fn))
        // if (!cfgFile) {
        //   throw new Error("No TS config file found")
        // }
        // const cfg = ts.readConfigFile(cfgFile, (fn) => fs.readFileSync(fn, "utf-8"))
        // const basePath = path.dirname(cfgFile); // equal to "getDirectoryPath" from ts, at least in our case.
        // const parsedConfig = ts.parseJsonConfigFileContent(cfg.config, ts.sys, basePath);
        // const program = ts.createProgram([sourcePath], parsedConfig.options)
        const { program } = utils_1.ESLintUtils.getParserServices(context);
        //console.log("$$ processing", sourcePath)
        // create and parse the AST
        const sourceFile = program.getSourceFile(sourcePath);
        // collect data-first declarations
        // const dataFirstDeclarations = sourceFile.statements
        //   .filter(ts.isFunctionDeclaration)
        //   // .filter(
        //   //   (node) =>
        //   //     node.modifiers &&
        //   //     node.modifiers.filter(
        //   //       (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
        //   //     ).length > 0
        //   // )
        //   // .filter((node) => !!node.name)
        //   // .filter((node) => node.parameters.length >= 2)
        //   // .filter((node) => node.name!.getText(sourceFile).endsWith("_"))
        //   // .map((node) => ({
        //   //   functionName: node.name!.getText(sourceFile),
        //   //   typeParameters: node.typeParameters || ts.factory.createNodeArray(),
        //   //   parameters: node.parameters || ts.factory.createNodeArray(),
        //   //   type: node.type!,
        //   //   implemented: !!node.body,
        //   //   jsDoc: getJSDoc(node)
        //   // }))
        //   // .filter((decl) => exclude.indexOf(decl.functionName) === -1)
        // // create the actual AST nodes
        // const nodes = dataFirstDeclarations.map(createPipeableFunctionDeclaration)
        // const expectedContent = nodes.map((node) => printNode(node, sourceFile)).join("\n")
        const pn = (0, compiler_1.processNode)(program.getTypeChecker(), sourceFile);
        let abc = [];
        // TODO: must return void, cannot use getChildren() etc, or it wont work, no idea why!  
        sourceFile.forEachChild(c => { abc = abc.concat(pn(c)); });
        const expectedContent = [
            "//",
            `/* eslint-disable */`,
            ...abc.filter((x) => !!x),
            `/* eslint-enable */`,
            "//"
        ].join("\n");
        // do not re-emit in a different style, or a loop will occur
        if (normalise(meta.existingContent) === normalise(expectedContent))
            return meta.existingContent;
        return expectedContent;
    }
    catch (e) {
        return ("/** Got exception: " +
            ("stack" in e ? e.stack : "") +
            JSON.stringify(e) +
            "*/");
    }
};
exports.model = model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJlc2V0cy9tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlFQUF1QztBQUN2QywwQ0FBcUM7QUFFckMsdUNBQXdCO0FBQ3hCLDBDQUF5QztBQUN6QyxTQUFTLFNBQVMsQ0FBQyxHQUFXO0lBQzVCLElBQUk7UUFDRixPQUFPLElBQUEsbUJBQVEsRUFDYixJQUFBLGNBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQVEsQ0FDckU7YUFDRSxJQUFJLENBQUE7UUFDTCxzQkFBc0I7UUFDdEIsMkJBQTJCO1FBQzNCLHdEQUF3RDtRQUN4RCxpQ0FBaUM7UUFDakMsd0JBQXdCO1FBQ3hCLHNCQUFzQjtRQUN0QixzQ0FBc0M7S0FDekM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sR0FBRyxDQUFBO0tBQ1g7QUFDSCxDQUFDO0FBQ0Qsb0NBQW9DO0FBQ3BDLG9EQUFzRDtBQUMvQyxNQUFNLEtBQUssR0FFYixDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsT0FBWSxFQUFFLEVBQUU7SUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO1FBQ2xDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxxRUFBcUUsQ0FBQyxDQUFBO1FBQ25HLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQTtLQUM1QjtJQUVELElBQUk7UUFDRixpQ0FBaUM7UUFDakMsb0RBQW9EO1FBRXBELDRCQUE0QjtRQUM1QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBO1FBQ2hDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNuRSxNQUFNLEtBQUssQ0FBQyw4QkFBOEIsVUFBVSxFQUFFLENBQUMsQ0FBQTtTQUN4RDtRQUNELDJFQUEyRTtRQUMzRSxrQkFBa0I7UUFDbEIsK0NBQStDO1FBQy9DLElBQUk7UUFFSiwrRUFBK0U7UUFDL0Usd0dBQXdHO1FBQ3hHLG9GQUFvRjtRQUVwRix1RUFBdUU7UUFHdkUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLG1CQUFXLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFM0QsMENBQTBDO1FBRTFDLDJCQUEyQjtRQUMzQixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUN0QyxVQUFVLENBQ1YsQ0FBQTtRQUVGLGtDQUFrQztRQUNsQyxzREFBc0Q7UUFDdEQsc0NBQXNDO1FBQ3RDLGdCQUFnQjtRQUNoQixtQkFBbUI7UUFDbkIsNkJBQTZCO1FBQzdCLGtDQUFrQztRQUNsQyx5RUFBeUU7UUFDekUsd0JBQXdCO1FBQ3hCLFNBQVM7UUFDVCxzQ0FBc0M7UUFDdEMsc0RBQXNEO1FBQ3RELHVFQUF1RTtRQUN2RSx5QkFBeUI7UUFDekIsdURBQXVEO1FBQ3ZELDhFQUE4RTtRQUM5RSxzRUFBc0U7UUFDdEUsMkJBQTJCO1FBQzNCLG1DQUFtQztRQUNuQywrQkFBK0I7UUFDL0IsV0FBVztRQUNYLG9FQUFvRTtRQUVwRSxpQ0FBaUM7UUFDakMsNkVBQTZFO1FBQzdFLHNGQUFzRjtRQUV0RixNQUFNLEVBQUUsR0FBRyxJQUFBLHNCQUFXLEVBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQzVELElBQUksR0FBRyxHQUE2QixFQUFFLENBQUE7UUFDdEMsd0ZBQXdGO1FBQ3hGLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFBLENBQUMsQ0FBQyxDQUFBO1FBQ3ZELE1BQU0sZUFBZSxHQUFHO1lBQ3RCLElBQUk7WUFDSixzQkFBc0I7WUFDdEIsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxxQkFBcUI7WUFDckIsSUFBSTtTQUNMLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRVosNERBQTREO1FBQzVELElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxTQUFTLENBQUMsZUFBZSxDQUFDO1lBQ2hFLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQTtRQUM3QixPQUFPLGVBQWUsQ0FBQTtLQUN2QjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUNMLHFCQUFxQjtZQUNyQixDQUFDLE9BQU8sSUFBSyxDQUFTLENBQUMsQ0FBQyxDQUFFLENBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQ0wsQ0FBQTtLQUNGO0FBQ0gsQ0FBQyxDQUFBO0FBekZZLFFBQUEsS0FBSyxTQXlGakIifQ==