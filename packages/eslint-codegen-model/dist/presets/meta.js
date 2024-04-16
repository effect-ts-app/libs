"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meta = void 0;
const effect_1 = require("effect");
/**
 * Adds file meta
 */
const meta = ({ meta, options }) => {
    const sourcePrefix = options.sourcePrefix || "src/";
    const moduleName = (0, effect_1.pipe)(meta
        .filename
        .substring(meta.filename.indexOf(sourcePrefix) + sourcePrefix.length, meta.filename.length - 3)
        .split("/"), effect_1.Array.dedupeAdjacent)
        .join("/");
    const expectedContent = `export const meta = { moduleName: "${moduleName}" }`;
    try {
        if (expectedContent === meta.existingContent) {
            return meta.existingContent;
        }
    }
    catch (_a) { }
    return expectedContent;
};
exports.meta = meta;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVzZXRzL21ldGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW9DO0FBR3BDOztHQUVHO0FBQ0ksTUFBTSxJQUFJLEdBQXNDLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRTtJQUMzRSxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxJQUFJLE1BQU0sQ0FBQTtJQUNuRCxNQUFNLFVBQVUsR0FBRyxJQUFBLGFBQUksRUFDckIsSUFBSTtTQUNELFFBQVE7U0FDUixTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDOUYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUNiLGNBQUssQ0FBQyxjQUFjLENBQ3JCO1NBQ0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ1osTUFBTSxlQUFlLEdBQUcsc0NBQXNDLFVBQVUsS0FBSyxDQUFBO0lBRTdFLElBQUksQ0FBQztRQUNILElBQUksZUFBZSxLQUFLLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUM3QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7UUFDN0IsQ0FBQztJQUNILENBQUM7SUFBQyxXQUFNLENBQUMsQ0FBQSxDQUFDO0lBRVYsT0FBTyxlQUFlLENBQUE7QUFDeEIsQ0FBQyxDQUFBO0FBbkJZLFFBQUEsSUFBSSxRQW1CaEIifQ==