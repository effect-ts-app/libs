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
                    // `  export const From: FromOps = { $: {} }`,
                    // `  /**`,
                    // `   * @tsplus type ${modelName}.From/Aspects`,
                    // `   */`,
                    // `  export interface FromAspects {}`,
                    "}",
                ];
            }
            //console.log("$$$ constructorName", constructorName)
            const t = tc.getTypeAtLocation(n);
            const result = { encoded: [], parsed: [] };
            const unions = {};
            //console.log("$$$ fields", t.getProperties().map(x => x.escapedName))
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
                `  export const From: FromOps = {}`,
                // `  export const From: FromOps = { $: {} }`,
                // `  /**`,
                // `   * @tsplus type ${modelName}.From/Aspects`,
                // `   */`,
                // `  export interface FromAspects {}`,
                `  /**`,
                `   * @tsplus type ${modelName}.From/Ops`,
                `   */`,
                `  export interface FromOps {}`,
                "}",
            ];
        }
    };
}
exports.processNode = processNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5REFBMkM7QUFFM0MsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEVBQUU7SUFDekMsSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSSxXQUFXLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQzVFLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDWCxDQUFDO0lBQ0QsSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxXQUFXLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQzdFLE9BQU8sQ0FBQyxDQUFBO0lBQ1YsQ0FBQztJQUNELElBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUFDLENBQUM7SUFDeEIsSUFBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFBQyxPQUFPLENBQUMsQ0FBQztJQUFDLENBQUM7SUFDdkIsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUE7QUFFRCxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsRUFBRTtJQUN6QyxJQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ3hCLElBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQUMsT0FBTyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ3ZCLE9BQU8sQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFBO0FBRUQsd0VBQXdFO0FBQ3hFLE1BQU0sRUFBRSxHQUFHLDhDQUE4QyxDQUFBO0FBRXpELFNBQVMsTUFBTSxDQUFDLEdBQVc7SUFDekIsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDckQsQ0FBQztBQUVELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQSxDQUFDLE9BQU87QUFFM0IsU0FBZ0IsV0FBVyxDQUFDLEVBQWtCLEVBQUUsSUFBYSxFQUFFLGNBQWMsR0FBRyxLQUFLO0lBQ25GLE1BQU0sU0FBUyxHQUFVLEVBQUUsQ0FBQTtJQUMzQixPQUFPLENBQUMsQ0FBVSxFQUFFLEVBQUU7O1FBQ3BCLEtBQUksNERBQTZELElBQUksRUFBRSxDQUFDO1lBRXRFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQTtZQUNwQixJQUFJLG9CQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxLQUFLLEdBQUcsb0JBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ2pDLElBQUksS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FBQyxVQUFrQixDQUFDLFdBQVcsS0FBSywyQkFBMkIsQ0FBQyxFQUFFLENBQUM7b0JBQ3hGLDJCQUEyQjtvQkFDM0IsK0NBQStDO29CQUMvQyxTQUFTLEdBQUcsTUFBQyxDQUFDLENBQUMsSUFBWSwwQ0FBRSxXQUFXLENBQUE7b0JBQ3hDLHlDQUF5QztnQkFDM0MsQ0FBQztZQUNILENBQUM7WUFDRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2pCLE1BQU0sZUFBZSxHQUFHLE1BQUMsQ0FBUyxDQUFDLElBQUksMENBQUUsV0FBVyxDQUFBO2dCQUNwRCwyQkFBMkI7Z0JBQzNCLElBQUksQ0FBQyxDQUFBLGVBQWUsYUFBZixlQUFlLHVCQUFmLGVBQWUsQ0FBRSxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUEsRUFBRSxDQUFDO29CQUM5QyxnRkFBZ0Y7b0JBQ2hGLE9BQU07Z0JBQ1IsQ0FBQztnQkFDRCxTQUFTLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUE7WUFDeEQsQ0FBQztZQUNELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUFDLE9BQU07WUFBQyxDQUFDO1lBQzdDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFFdkIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNwQixPQUFPO29CQUNMLG9CQUFvQixTQUFTLElBQUk7b0JBQ2pDLE9BQU87b0JBQ1AscUJBQXFCLFNBQVMsT0FBTztvQkFDckMsMEJBQTBCLFNBQVMsV0FBVztvQkFDOUMsT0FBTztvQkFDUCxnREFBZ0QsU0FBUyxRQUFRO29CQUNqRSw4Q0FBOEM7b0JBQzlDLFdBQVc7b0JBQ1gsaURBQWlEO29CQUNqRCxXQUFXO29CQUNYLHVDQUF1QztvQkFDdkMsR0FBRztpQkFDSixDQUFBO1lBQ0gsQ0FBQztZQUVELHFEQUFxRDtZQUVyRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFFakMsTUFBTSxNQUFNLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBYyxFQUFFLE1BQU0sRUFBRSxFQUFjLEVBQUUsQ0FBQTtZQUNsRSxNQUFNLE1BQU0sR0FBMkIsRUFBRSxDQUFBO1lBRXpDLHNFQUFzRTtZQUN0RSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlCLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUE7Z0JBQ3JCLElBQUksTUFBTSxLQUFLLFNBQVMsSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQ2hELG1DQUFtQztvQkFDbkMsd0JBQXdCO29CQUN4QixNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMseUJBQXlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO29CQUM3QyxtRUFBbUU7b0JBRW5FLGlFQUFpRTtvQkFHakUsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTs7d0JBQzdCLE1BQU0sUUFBUSxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUMsV0FBVyxLQUFLLFNBQVMsQ0FBQTt3QkFFckQsY0FBYzt3QkFDZCwyQ0FBMkM7d0JBQzNDLG9DQUFvQzt3QkFDcEMscUNBQXFDO3dCQUNuQyw0RUFBNEU7d0JBRTVFLHFEQUFxRDt3QkFDckQsZUFBZTt3QkFDZix3SkFBd0o7d0JBQ3hKLDBCQUEwQjt3QkFDeEIsTUFBQSxDQUFDLENBQUMsWUFBWSwwQ0FBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFOzs0QkFDMUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQ0FDYixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBOzRCQUN0QyxDQUFDOzRCQUNILElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyx1QkFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsK0NBQStDO2dDQUN6RixJQUFJLEVBQUUsR0FBSSxDQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO2dDQUNoQywyQ0FBMkM7Z0NBQzNDLElBQUksUUFBUSxFQUFFLENBQUM7b0NBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUE7Z0NBQ2pDLENBQUM7Z0NBQ0QsTUFBTSxVQUFVLEdBQUcsQ0FBQSxNQUFBLEVBQUUsQ0FBQyxVQUFVLDBDQUFFLFdBQVcsTUFBSyxVQUFVLENBQUE7Z0NBQzVELE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLDJDQUEyQztnQ0FDeEYsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQ0FDVCw2Q0FBNkM7b0NBQzdDLHFHQUFxRztvQ0FDckcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7Z0NBQzVDLENBQUM7Z0NBQ0QsMEJBQTBCO2dDQUMxQiwwQkFBMEI7Z0NBQzFCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLDRDQUE0QztnQ0FDL0UsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FDOUIsRUFBRSxFQUNGLElBQUksRUFDSixvQkFBRSxDQUFDLGVBQWUsQ0FBQyxZQUFZO29DQUMvQix5QkFBeUI7b0NBQ3pCLG1DQUFtQztvQ0FDbkMsdUNBQXVDO29DQUN2QyxrREFBa0Q7b0NBQy9DLGtDQUFrQztzQ0FDakMsb0JBQUUsQ0FBQyxlQUFlLENBQUMsa0NBQWtDLENBQUMscUJBQXFCO2dDQUMvRSw4Q0FBOEM7aUNBQy9DLENBQUE7Z0NBQ0QsSUFBSSxRQUFRLEVBQUUsQ0FBQztvQ0FDYixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtnQ0FDbEMsQ0FBQztnQ0FDRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dDQUNsQyxJQUFJLFFBQVEsRUFBRSxDQUFDO29DQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFBO2dDQUN0QyxDQUFDO2dDQUNELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtnQ0FDakQsSUFBSSxPQUFPLEVBQUUsQ0FBQztvQ0FDWixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7b0NBQ2hFLFFBQVEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFBO29DQUN0SSwrREFBK0Q7b0NBQy9ELHdDQUF3QztvQ0FDeEMsNEJBQTRCO29DQUM1QixJQUFJO29DQUNKLElBQUksUUFBUSxFQUFFLENBQUM7d0NBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQTtvQ0FDdkQsQ0FBQztvQ0FDRCxJQUFJLEVBQUUsQ0FBQyxXQUFXLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyw0QkFBNEIsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQzt3Q0FDcEksTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTt3Q0FDdkcsd0NBQXdDO3dDQUN4QyxrREFBa0Q7d0NBQ2xELHFDQUFxQzt3Q0FDckMsV0FBVzt3Q0FDWCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsV0FBVyxDQUFBO3dDQUM5QixJQUFJLFFBQVEsRUFBRSxDQUFDOzRDQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUE7d0NBQ2xELENBQUM7d0NBQ0QsR0FBRztvQ0FDTCxDQUFDO3lDQUFNLENBQUM7d0NBQ1IsZ0JBQWdCO3dDQUNoQixzREFBc0Q7d0NBQ3RELElBQUk7d0NBQ0osMENBQTBDO29DQUMxQyxDQUFDO2dDQUNILENBQUM7NEJBRUgsQ0FBQzs0QkFDRCx3Q0FBd0M7NEJBQ3hDLDhDQUE4Qzt3QkFDaEQsQ0FBQyxDQUFDLENBQUMsQ0FBQTt3QkFDTCxHQUFHO29CQUNMLENBQUMsQ0FBQyxDQUFBO29CQUVGLElBQUksS0FBSyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLENBQUE7b0JBQzlDLENBQUM7b0JBRUQsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FDOUIsRUFBRSxFQUNGLElBQUksRUFDSixvQkFBRSxDQUFDLGVBQWUsQ0FBQyxZQUFZO3dCQUMvQix5QkFBeUI7d0JBQ3pCLG1DQUFtQzt3QkFDbkMsdUNBQXVDO3dCQUN2QyxrREFBa0Q7d0JBQy9DLGtDQUFrQzswQkFDakMsb0JBQUUsQ0FBQyxlQUFlLENBQUMsa0NBQWtDLENBQUMscUJBQXFCO29CQUMvRSw4Q0FBOEM7cUJBQy9DLENBQUE7b0JBQ0QsTUFBTSxHQUFHLEdBQUcsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ3BDLGdDQUFnQzt3QkFDaEMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7NkJBQ3ZDLEtBQUssQ0FBQyxHQUFHLENBQUM7NkJBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDOzRCQUNuQixrREFBa0Q7NkJBQ2pELEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7OzRCQUM5QixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7NEJBQ3pCLDZEQUE2RDs0QkFDN0QsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7Z0NBQ2pDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO2dDQUNuRCxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsTUFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLG1DQUFJLEdBQUcsQ0FBQTs0QkFDeEQsQ0FBQzs0QkFFRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7NEJBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7d0JBQzFCLENBQUMsQ0FBQzs2QkFDRCxVQUFVLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUMseURBQXlEOzZCQUNsRyxVQUFVLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQzs2QkFDOUIsVUFBVSxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUM7NkJBQ3BDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyx5REFBeUQ7NkJBQ2xHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDOzZCQUM5QixVQUFVLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQzs2QkFDbEMsVUFBVSxDQUFDLGVBQWUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLHlEQUF5RDs2QkFDeEcsVUFBVSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUM7NkJBQ2xDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQzVDOzRCQUNILDBIQUEwSDs2QkFDekgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO29CQUNoQiwyRUFBMkU7b0JBQzNFLHlDQUF5QztvQkFFekMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQTtnQkFDdEIsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFBO1lBRUYsSUFBSSxDQUFDLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtZQUNyQyxDQUFDO1lBQ0QsSUFBSSxDQUFDLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtZQUN0QyxDQUFDO1lBR0QsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDL0MsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFFN0MsT0FBTztnQkFDTCxvQkFBb0IsU0FBUyxLQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRztnQkFDNUcsb0JBQW9CLFNBQVMsSUFBSTtnQkFDakMsT0FBTztnQkFDUCxxQkFBcUIsU0FBUyxPQUFPO2dCQUNyQyxPQUFPO2dCQUNQLDRCQUE0QixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUc7Z0JBQzVHLG1DQUFtQztnQkFDbkMsOENBQThDO2dCQUM5QyxXQUFXO2dCQUNYLGlEQUFpRDtnQkFDakQsV0FBVztnQkFDWCx1Q0FBdUM7Z0JBQ3ZDLE9BQU87Z0JBQ1AscUJBQXFCLFNBQVMsV0FBVztnQkFDekMsT0FBTztnQkFDUCwrQkFBK0I7Z0JBQy9CLEdBQUc7YUFDSixDQUFBO1FBQ0gsQ0FBQztJQUNILENBQUMsQ0FBQTtBQUNILENBQUM7QUE1T0Qsa0NBNE9DIn0=