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
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNode = void 0;
const typescript_1 = __importStar(require("typescript"));
const sortUnion = (a, b) => {
    if (a !== "null" && a !== "undefined" && (b === "null" || b === "undefined")) {
        return -1;
    }
    if (b !== "null" && b !== "undefined" && (a === "null" || a === "undefined")) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
};
const sortAlpha = (a, b) => {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
};
// TODO: we don't support string literals with spaces in them currently.
const rx = /(([^\s\<\>\,\[\(]+)? \| ([^\s\<\>\,\]\)]+))+/;
function sortIt(str) {
    return str.split(" | ").sort(sortUnion).join(" | ");
}
const debug = false; // true
function processNode(tc, root, writeFullTypes = false) {
    const processed = [];
    return (n) => {
        var _a, _b;
        if ( /*ts.isClassDeclaration(n) || ts.isTypeAliasDeclaration(n)*/true) {
            let modelName = null;
            if (typescript_1.default.canHaveDecorators(n)) {
                const decor = typescript_1.default.getDecorators(n);
                if (decor === null || decor === void 0 ? void 0 : decor.some(_ => _.expression.escapedText === "useClassFeaturesForSchema")) {
                    //useClassFeaturesForSchema
                    //console.log("$$ decors", ts.getDecorators(n))
                    modelName = (_a = n.name) === null || _a === void 0 ? void 0 : _a.escapedText;
                    //console.log("$$$ modelName", modelName)
                }
            }
            if (!modelName) {
                const constructorName = (_b = n.name) === null || _b === void 0 ? void 0 : _b.escapedText;
                // TODO: Remove requirement
                if (!(constructorName === null || constructorName === void 0 ? void 0 : constructorName.endsWith("Constructor"))) {
                    //console.log("$$$constructorName doesnt end with Constructor", constructorName)
                    return;
                }
                modelName = constructorName.replace("Constructor", "");
            }
            if (processed.includes(modelName)) {
                return;
            }
            processed.push(modelName);
            if (!writeFullTypes) {
                return [
                    `export namespace ${modelName} {`,
                    `  /**`,
                    `   * @tsplus type ${modelName}.From`,
                    `   * @tsplus companion ${modelName}.From/Ops`,
                    `   */`,
                    `  export class From extends FromClass<typeof ${modelName}>() {}`,
                    // `  export const From: EncodedOps = { $: {} }`,
                    // `  /**`,
                    // `   * @tsplus type ${modelName}.From/Aspects`,
                    // `   */`,
                    // `  export interface EncodedAspects {}`,
                    "  export interface ConstructorInput",
                    `    extends ConstructorInputFromApi<typeof ${modelName}> {}`,
                    `  export interface Fields extends GetProvidedProps<typeof ${modelName}> {}`,
                    "}",
                ];
            }
            //console.log("$$$ constructorName", constructorName)
            const t = tc.getTypeAtLocation(n);
            const result = { encoded: [], parsed: [] };
            const unions = {};
            //console.log("$$$ props", t.getProperties().map(x => x.escapedName))
            t.getProperties().forEach((c) => {
                const method = c.name;
                if (method === "encoded" || method === "parsed") {
                    //console.log("$$$ method", method)
                    //console.log(c.members)
                    const tt = tc.getTypeOfSymbolAtLocation(c, n);
                    // const s = tc.getReturnTypeOfSignature(tt.getCallSignatures()[0])
                    // const type = tc.getReturnTypeOfSignature(s! as any /* TODO */)
                    tt.getProperties().forEach(p => {
                        var _a;
                        const isLookup = debug && p.escapedName === "carrier";
                        //kind = 207, 
                        //arguments[0].escapedText === "HosterRole"
                        //console.log("$$$p", p.escapedName)
                        //if (p.escapedName === "opposite") {
                        //console.log("$$$ a union!", p.declarations?.map(x => x.forEachChild(c => {
                        // TODO: have to find nullable, array, set, map, etc.
                        // TODO: "From"
                        // but also should find fully custom sets like PurchaseOrderModulesSet - we should be able to just use those directly, incl PurchaseOrderModulesSet.From
                        // for now just skip them?
                        (_a = p.declarations) === null || _a === void 0 ? void 0 : _a.map(x => x.forEachChild(c => {
                            var _a;
                            if (isLookup) {
                                console.log("$$$ lookup", c.kind, c);
                            }
                            if (c.kind === typescript_1.SyntaxKind.CallExpression) { // 207 -- SyntaxKind.ElementAccessExpression) {
                                let it = c.arguments[0];
                                //const isState = p.escapedName === "state"
                                if (isLookup) {
                                    console.log("$$$ state it", it);
                                }
                                const isNullable = ((_a = it.expression) === null || _a === void 0 ? void 0 : _a.escapedText) === "nullable";
                                const isIt = it.arguments && it.arguments[0]; //it.expression?.escapedText === "nullable"
                                if (isIt) {
                                    //console.log("$$ nullable", it.arguments[0])
                                    // TODO: usually the union is on the last input, we need to support all elements individually however
                                    it = it.arguments[it.arguments.length - 1];
                                }
                                //console.log("$args", it)
                                //tc.getTypeAtLocation(it)
                                const tt = tc.getTypeAtLocation(c); //tc.getTypeOfSymbolAtLocation(it.parent, n)
                                const typeDecl = tc.typeToString(tt, root, typescript_1.default.TypeFormatFlags.NoTruncation
                                    //ts.TypeFormatFlags.None
                                    //ts.TypeFormatFlags.AddUndefined |
                                    // | ts.TypeFormatFlags.NoTypeReduction
                                    //    | ts.TypeFormatFlags.MultilineObjectLiterals
                                    //| ts.TypeFormatFlags.InTypeAlias
                                    | typescript_1.default.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope // prevents import(*)
                                //  | ts.TypeFormatFlags.UseStructuralFallback
                                );
                                if (isLookup) {
                                    console.log("$$ type", typeDecl);
                                }
                                const matches = typeDecl.match(rx);
                                if (isLookup) {
                                    console.log("$$ matches", matches);
                                }
                                const isOptional = typeDecl.match(/\>, "optional"/);
                                if (matches) {
                                    let replaced = matches[0].replace(rx, (match) => sortIt(match));
                                    replaced = sortIt(isOptional ? isNullable ? replaced.replace(" | null", " | undefined | null") : replaced + " | undefined" : replaced);
                                    //console.log("$$ replaced", replaced, it.escapedText, matches)
                                    // if (it.escapedText === "TaskState") {
                                    //   console.log("Help", it)
                                    // }
                                    if (isLookup) {
                                        console.log("$$$ replaced", it.escapedText, replaced);
                                    }
                                    if (it.escapedText && !it.escapedText.endsWith("Set") /* skip the "Set" problem */ && replaced.replace(" | null", "").includes("|")) {
                                        const replacement = it.escapedText + (isNullable ? " | null" : "") + (isOptional ? " | undefined" : "");
                                        // if (it.escapedText === "TaskState") {
                                        //   console.log("$$$", { replaced, replacement })
                                        //   unions[replaced] = replacement  
                                        // } else {
                                        unions[replaced] = replacement;
                                        if (isLookup) {
                                            console.log("$$ repl", { replaced, replacement });
                                        }
                                        //}
                                    }
                                    else {
                                        //   if (isIt) {
                                        //     console.log("$$ no name found", it.escapedText)
                                        // }
                                        //   console.log("$$ no name found??", it)
                                    }
                                }
                            }
                            //c.kind === 346 ? console.log(c) : null
                            //console.log((c as any).flowNode?.node?.name)
                        }));
                        //}
                    });
                    if (debug && Object.keys(unions).length) {
                        console.log("$$$ unions to replace", unions);
                    }
                    const typeDecl = tc.typeToString(tt, root, typescript_1.default.TypeFormatFlags.NoTruncation
                        //ts.TypeFormatFlags.None
                        //ts.TypeFormatFlags.AddUndefined |
                        // | ts.TypeFormatFlags.NoTypeReduction
                        //    | ts.TypeFormatFlags.MultilineObjectLiterals
                        //| ts.TypeFormatFlags.InTypeAlias
                        | typescript_1.default.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope // prevents import(*)
                    //  | ts.TypeFormatFlags.UseStructuralFallback
                    );
                    const str = typeDecl === "{}" ? [] :
                        // drop leading { and trailing }
                        typeDecl.substring(2, typeDecl.length - 2)
                            .split(";")
                            .map(l => l.trim())
                            // todo; skip the first split, as its the property
                            .map(l => l.replace(rx, (match) => {
                            var _a;
                            const rpl = sortIt(match);
                            //if (debug) { console.log("Searching for", rpl, { unions}) }
                            if (rpl.endsWith(" | undefined")) {
                                const sub = unions[rpl.replace(" | undefined", "")];
                                return sub ? sub + " | undefined" : (_a = unions[rpl]) !== null && _a !== void 0 ? _a : rpl;
                            }
                            const sub = unions[rpl];
                            return (sub ? sub : rpl);
                        })
                            .replaceAll(" Array<", " ReadonlyArray<") // .replaceAll(/(Array|Set|Map)\</", "ReadonlyArray<") //
                            .replaceAll(" Set<", " ROSet<")
                            .replaceAll(" Map<", " ReadonlyMap<")
                            .replaceAll("(Array<", "(ReadonlyArray<") // .replaceAll(/(Array|Set|Map)\</", "ReadonlyArray<") //
                            .replaceAll("(Set<", "(ROSet<")
                            .replaceAll("(Map<", "(ReadonlyMap<")
                            .replaceAll(" Array.Array<", " ReadonlyArray<") // .replaceAll(/(Array|Set|Map)\</", "ReadonlyArray<") //
                            .replaceAll(" Set.Set<", " ROSet<")
                            .replaceAll(" Map.Map<", " ReadonlyMap<"))
                            // we sort for now, because otherwise we have sometimes multiple times changing back and forth between editor and console.
                            .sort(sortAlpha);
                    // Taken care of by "ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope"
                    //.replaceAll(/import\("[^"]+"\)\./g, "")
                    result[method] = str;
                }
            });
            if (!("parsed" in result)) {
                throw new Error("No parsed result");
            }
            if (!("encoded" in result)) {
                throw new Error("No encoded result");
            }
            const encoded = result.encoded.filter(x => !!x);
            const parsed = result.parsed.filter(x => !!x);
            return [
                `export interface ${modelName} {${parsed.length ? "\n" + parsed.map(l => "  " + l).join("\n") + "\n" : ""}}`,
                `export namespace ${modelName} {`,
                `  /**`,
                `   * @tsplus type ${modelName}.From`,
                `   */`,
                `  export interface From {${encoded.length ? "\n" + encoded.map(l => "    " + l).join("\n") + "\n  " : ""}}`,
                `  export const From: EncodedOps = {}`,
                // `  export const From: EncodedOps = { $: {} }`,
                // `  /**`,
                // `   * @tsplus type ${modelName}.From/Aspects`,
                // `   */`,
                // `  export interface EncodedAspects {}`,
                `  /**`,
                `   * @tsplus type ${modelName}.From/Ops`,
                `   */`,
                `  export interface EncodedOps {}`,
                "  export interface ConstructorInput",
                `    extends ConstructorInputFromApi<typeof ${modelName}> {}`,
                `  export interface Fields extends GetProvidedProps<typeof ${modelName}> {}`,
                "}",
            ];
        }
    };
}
exports.processNode = processNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5REFBMkM7QUFFM0MsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEVBQUU7SUFDekMsSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSSxXQUFXLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQzVFLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDWCxDQUFDO0lBQ0QsSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxXQUFXLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQzdFLE9BQU8sQ0FBQyxDQUFBO0lBQ1YsQ0FBQztJQUNELElBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUFDLENBQUM7SUFDeEIsSUFBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFBQyxPQUFPLENBQUMsQ0FBQztJQUFDLENBQUM7SUFDdkIsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUE7QUFFRCxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsRUFBRTtJQUN6QyxJQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ3hCLElBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQUMsT0FBTyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ3ZCLE9BQU8sQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFBO0FBRUQsd0VBQXdFO0FBQ3hFLE1BQU0sRUFBRSxHQUFH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