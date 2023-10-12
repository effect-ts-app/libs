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
const utils_1 = require("@typescript-eslint/utils");
const model = ({ meta, options }, context) => {
    if (!context.parserOptions.project) {
        console.warn(`${meta.filename}: Cannot run ESLint Model plugin, because no TS Compiler is enabled`);
        return meta.existingContent;
    }
    const writeFullTypes = !!options.writeFullTypes;
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
        const pn = (0, compiler_1.processNode)(program.getTypeChecker(), sourceFile, writeFullTypes);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJlc2V0cy9tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlFQUF1QztBQUN2QywwQ0FBcUM7QUFFckMsdUNBQXdCO0FBQ3hCLDBDQUF5QztBQUN6QyxTQUFTLFNBQVMsQ0FBQyxHQUFXO0lBQzVCLElBQUksQ0FBQztRQUNILE9BQU8sSUFBQSxtQkFBUSxFQUNiLElBQUEsY0FBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBUSxDQUNyRTthQUNFLElBQUksQ0FBQTtRQUNMLHNCQUFzQjtRQUN0QiwyQkFBMkI7UUFDM0Isd0RBQXdEO1FBQ3hELGlDQUFpQztRQUNqQyx3QkFBd0I7UUFDeEIsc0JBQXNCO1FBQ3RCLHNDQUFzQztJQUMxQyxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLE9BQU8sR0FBRyxDQUFBO0lBQ1osQ0FBQztBQUNILENBQUM7QUFFRCxvREFBc0Q7QUFDL0MsTUFBTSxLQUFLLEdBRWIsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxPQUFZLEVBQUUsRUFBRTtJQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEscUVBQXFFLENBQUMsQ0FBQTtRQUNuRyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7SUFDN0IsQ0FBQztJQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFBO0lBRS9DLElBQUksQ0FBQztRQUNILGlDQUFpQztRQUNqQyxvREFBb0Q7UUFFcEQsNEJBQTRCO1FBQzVCLE1BQU0sVUFBVSxHQUFHLElBQUks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