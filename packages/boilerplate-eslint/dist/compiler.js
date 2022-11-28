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
function processNode(tc, root) {
    return (n) => {
        var _a;
        if ( /*ts.isClassDeclaration(n) || ts.isTypeAliasDeclaration(n)*/true) {
            const constructorName = (_a = n.name) === null || _a === void 0 ? void 0 : _a.escapedText;
            if (!(constructorName === null || constructorName === void 0 ? void 0 : constructorName.endsWith("Constructor"))) {
                //console.log("$$$constructorName doesnt end with Constructor", constructorName)
                return;
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
                            .replaceAll(" Array<", " ROArray<") // .replaceAll(/(Array|Set|Map)\</", "ROArray<") //
                            .replaceAll(" Set<", " ROSet<")
                            .replaceAll(" Map<", " ROMap<")
                            .replaceAll("(Array<", "(ROArray<") // .replaceAll(/(Array|Set|Map)\</", "ROArray<") //
                            .replaceAll("(Set<", "(ROSet<")
                            .replaceAll("(Map<", "(ROMap<")
                            .replaceAll(" Array.Array<", " ROArray<") // .replaceAll(/(Array|Set|Map)\</", "ROArray<") //
                            .replaceAll(" Set.Set<", " ROSet<")
                            .replaceAll(" Map.Map<", " ROMap<"))
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
            const modelName = constructorName.replace("Constructor", "");
            const encoded = result.encoded.filter(x => !!x);
            const parsed = result.parsed.filter(x => !!x);
            return [
                `export interface ${modelName} {${parsed.length ? "\n" + parsed.map(l => "  " + l).join("\n") + "\n" : ""}}`,
                `export namespace ${modelName} {`,
                `  /**`,
                `   * @tsplus type ${modelName}.Encoded`,
                `   */`,
                `  export interface Encoded {${encoded.length ? "\n" + encoded.map(l => "    " + l).join("\n") + "\n  " : ""}}`,
                `  export const Encoded: EncodedOps = { $: {} }`,
                `  /**`,
                `   * @tsplus type ${modelName}.Encoded/Aspects`,
                `   */`,
                `  export interface EncodedAspects {}`,
                `  /**`,
                `   * @tsplus type ${modelName}.Encoded/Ops`,
                `   */`,
                `  export interface EncodedOps { $: EncodedAspects }`,
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