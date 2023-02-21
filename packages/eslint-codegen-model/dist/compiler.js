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
    return (n) => {
        var _a;
        if ( /*ts.isClassDeclaration(n) || ts.isTypeAliasDeclaration(n)*/true) {
            const constructorName = (_a = n.name) === null || _a === void 0 ? void 0 : _a.escapedText;
            // TODO: Remove requirement
            if (!(constructorName === null || constructorName === void 0 ? void 0 : constructorName.endsWith("Constructor"))) {
                //console.log("$$$constructorName doesnt end with Constructor", constructorName)
                return;
            }
            const modelName = constructorName.replace("Constructor", "");
            if (!writeFullTypes) {
                return [
                    `export namespace ${modelName} {`,
                    `  /**`,
                    `   * @tsplus type ${modelName}.Encoded`,
                    `   */`,
                    `  export interface Encoded extends EncodedOf<typeof ${modelName}> {}`,
                    `  export const Encoded: EncodedOps = {}`,
                    // `  export const Encoded: EncodedOps = { $: {} }`,
                    // `  /**`,
                    // `   * @tsplus type ${modelName}.Encoded/Aspects`,
                    // `   */`,
                    // `  export interface EncodedAspects {}`,
                    `  /**`,
                    `   * @tsplus type ${modelName}.Encoded/Ops`,
                    `   */`,
                    `  export interface EncodedOps {}`,
                    "  export interface ConstructorInput",
                    `    extends ConstructorInputFromApi<typeof ${modelName}> {}`,
                    `  export interface Props extends GetProvidedProps<typeof ${modelName}> {}`,
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
                        // TODO: "Encoded"
                        // but also should find fully custom sets like PurchaseOrderModulesSet - we should be able to just use those directly, incl PurchaseOrderModulesSet.Encoded
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
                `   * @tsplus type ${modelName}.Encoded`,
                `   */`,
                `  export interface Encoded {${encoded.length ? "\n" + encoded.map(l => "    " + l).join("\n") + "\n  " : ""}}`,
                `  export const Encoded: EncodedOps = {}`,
                // `  export const Encoded: EncodedOps = { $: {} }`,
                // `  /**`,
                // `   * @tsplus type ${modelName}.Encoded/Aspects`,
                // `   */`,
                // `  export interface EncodedAspects {}`,
                `  /**`,
                `   * @tsplus type ${modelName}.Encoded/Ops`,
                `   */`,
                `  export interface EncodedOps {}`,
                "  export interface ConstructorInput",
                `    extends ConstructorInputFromApi<typeof ${modelName}> {}`,
                `  export interface Props extends GetProvidedProps<typeof ${modelName}> {}`,
                "}",
            ];
        }
    };
}
exports.processNode = processNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5REFBMkM7QUFFM0MsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEVBQUU7SUFDekMsSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSSxXQUFXLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxXQUFXLENBQUMsRUFBRTtRQUMzRSxPQUFPLENBQUMsQ0FBQyxDQUFBO0tBQ1Y7SUFDRCxJQUFJLENBQUMsS0FBSyxNQUFNLElBQUksQ0FBQyxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsS0FBSyxNQUFNLElBQUksQ0FBQyxLQUFLLFdBQVcsQ0FBQyxFQUFFO1FBQzVFLE9BQU8sQ0FBQyxDQUFBO0tBQ1Q7SUFDRCxJQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQUU7SUFDeEIsSUFBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQUUsT0FBTyxDQUFDLENBQUM7S0FBRTtJQUN2QixPQUFPLENBQUMsQ0FBQztBQUNYLENBQUMsQ0FBQTtBQUVELE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxFQUFFO0lBQ3pDLElBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FBRTtJQUN4QixJQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFBRSxPQUFPLENBQUMsQ0FBQztLQUFFO0lBQ3ZCLE9BQU8sQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFBO0FBRUQsd0VBQXdFO0FBQ3hFLE1BQU0sRUFBRSxHQUFHLDhDQUE4QyxDQUFBO0FBRXpELFNBQVMsTUFBTSxDQUFDLEdBQVc7SUFDekIsT0FBTyxHQUFHLENBQUMs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