import generate from "@babel/generator"
import { parse } from "@babel/parser"
import type { Preset } from "eslint-plugin-codegen"
import * as fs from "fs"
import { processNode } from "../compiler"
function normalise(str: string) {
  try {
    return generate(
      parse(str, { sourceType: "module", plugins: ["typescript"] }) as any
    )
      .code
      // .replace(/'/g, `"`)
      // .replace(/\/index/g, "")
      //.replace(/([\n\s]+ \|)/g, " |").replaceAll(": |", ":")
      //.replaceAll(/[\s\n]+\|/g, " |")
      //.replaceAll("\n", ";")
      //.replaceAll(" ", "")
      // TODO: remove all \n and whitespace?
  } catch (e) {
    return str
  }
}
// TODO: get shared compiler host...
import { ESLintUtils } from "@typescript-eslint/utils"
export const model: Preset<{
  exclude?: string
}> = ({ meta }, context: any) => {
  if (!context.parserOptions.project) {
    console.warn(`${meta.filename}: Cannot run ESLint Model plugin, because no TS Compiler is enabled`)
    return meta.existingContent
  }

  try {
    // option to exclude some methods
    //const exclude = (options.exclude || "").split(",")

    // checks and reads the file
    const sourcePath = meta.filename
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
      throw Error(`Source path is not a file: ${sourcePath}`)
    }
    // const cfgFile = ts.findConfigFile(sourcePath, (fn) => fs.existsSync(fn))
    // if (!cfgFile) {
    //   throw new Error("No TS config file found")
    // }

    // const cfg = ts.readConfigFile(cfgFile, (fn) => fs.readFileSync(fn, "utf-8"))
    // const basePath = path.dirname(cfgFile); // equal to "getDirectoryPath" from ts, at least in our case.
    // const parsedConfig = ts.parseJsonConfigFileContent(cfg.config, ts.sys, basePath);

    // const program = ts.createProgram([sourcePath], parsedConfig.options)


    const { program } = ESLintUtils.getParserServices(context);

    //console.log("$$ processing", sourcePath)

    // create and parse the AST
    const sourceFile = program.getSourceFile(
      sourcePath,
    )!

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

    const pn = processNode(program.getTypeChecker(), sourceFile)
    let abc: (string[] | undefined)[] = []
    // TODO: must return void, cannot use getChildren() etc, or it wont work, no idea why!  
    sourceFile.forEachChild(c => {abc = abc.concat(pn(c))})
    const expectedContent = [
      "//",
      `/* eslint-disable */`,      
      ...abc.filter((x): x is string[] => !!x),
      `/* eslint-enable */`,
      "//"
    ].join("\n")

    // do not re-emit in a different style, or a loop will occur
    if (normalise(meta.existingContent) === normalise(expectedContent))
      return meta.existingContent
    return expectedContent
  } catch (e) {
    return (
      "/** Got exception: " +
      ("stack" in (e as any) ? (e as any).stack : "") +
      JSON.stringify(e) +
      "*/"
    )
  }
}
