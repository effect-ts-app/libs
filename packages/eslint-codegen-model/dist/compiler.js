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
                    `   * @tsplus companion ${modelName}.Encoded/Ops`,
                    `   */`,
                    `  export class Encoded extends EncodedClass<typeof ${modelName}>() {}`,
                    // `  export const Encoded: EncodedOps = { $: {} }`,
                    // `  /**`,
                    // `   * @tsplus type ${modelName}.Encoded/Aspects`,
                    // `   */`,
                    // `  export interface EncodedAspects {}`,
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