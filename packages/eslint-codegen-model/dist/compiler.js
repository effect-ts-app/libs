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
            if (typescript_1.default.isClassDeclaration(n)) {
                if (n.getText().match(/(Extended(Tagged)?Class)|ExtendedTaggedRequest/)) {
                    modelName = (_a = n.name) === null || _a === void 0 ? void 0 : _a.escapedText;
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
                    `  export class From extends S.FromClass<typeof ${modelName}>() {}`,
                    // `  export const From: FromOps = { $: {} }`,
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
                            .replaceAll(" Set<", " ReadonlySet<")
                            .replaceAll(" Map<", " ReadonlyMap<")
                            .replaceAll("(Array<", "(ReadonlyArray<") // .replaceAll(/(Array|Set|Map)\</", "ReadonlyArray<") //
                            .replaceAll("(Set<", "(ReadonlySet<")
                            .replaceAll("(Map<", "(ReadonlyMap<")
                            .replaceAll(" Array.Array<", " ReadonlyArray<") // .replaceAll(/(Array|Set|Map)\</", "ReadonlyArray<") //
                            .replaceAll(" Set.Set<", " ReadonlySet<")
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
                `  export interface From {${encoded.length ? "\n" + encoded.map(l => "    " + l).join("\n") + "\n  " : ""}}`,
                `  export const From: FromOps = {}`,
                // `  export const From: FromOps = { $: {} }`,
                // `  export interface FromAspects {}`,
                `  export interface FromOps {}`,
                "}",
            ];
        }
    };
}
exports.processNode = processNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5REFBMkM7QUFFM0MsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLEVBQUU7SUFDekMsSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSSxXQUFXLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQzVFLE9BQU8sQ0FBQyxDQUFDLENBQUE7SUFDWCxDQUFDO0lBQ0QsSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxXQUFXLElBQUksQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFJLENBQUMsS0FBSyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQzdFLE9BQU8sQ0FBQyxDQUFBO0lBQ1YsQ0FBQztJQUNELElBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUFDLENBQUM7SUFDeEIsSUFBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFBQyxPQUFPLENBQUMsQ0FBQztJQUFDLENBQUM7SUFDdkIsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUE7QUFFRCxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsRUFBRTtJQUN6QyxJQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ3hCLElBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQUMsT0FBTyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ3ZCLE9BQU8sQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFBO0FBRUQsd0VBQXdFO0FBQ3hFLE1BQU0sRUFBRSxHQUFH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