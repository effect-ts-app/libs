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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJlc2V0cy9tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlFQUF1QztBQUN2QywwQ0FBcUM7QUFFckMsdUNBQXdCO0FBQ3hCLDBDQUF5QztBQUN6QyxTQUFTLFNBQVMsQ0FBQyxHQUFXO0lBQzVCLElBQUk7UUFDRixPQUFPLElBQUEsbUJBQVEsRUFDYixJQUFBLGNBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQVEsQ0FDckU7YUFDRSxJQUFJLENBQUE7UUFDTCxzQkFBc0I7UUFDdEIsMkJBQTJCO1FBQzNCLHdEQUF3RDtRQUN4RCxpQ0FBaUM7UUFDakMsd0JBQXdCO1FBQ3hCLHNCQUFzQjtRQUN0QixzQ0FBc0M7S0FDekM7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sR0FBRyxDQUFBO0tBQ1g7QUFDSCxDQUFDO0FBQ0Qsb0NBQW9DO0FBQ3BDLG9EQUFzRDtBQUMvQyxNQUFNLEtBQUssR0FFYixDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFLE9BQVksRUFBRSxFQUFFO0lBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtRQUNsQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEscUVBQXFFLENBQUMsQ0FBQTtRQUNuRyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7S0FDNUI7SUFFRCxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQTtJQUUvQyxJQUFJO1FBQ0YsaUNBQWlDO1FBQ2pDLG9EQUFvRDtRQUVwRCw0QkFBNEI7UUFDNUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUNoQyxJ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