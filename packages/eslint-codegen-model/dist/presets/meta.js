"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meta = void 0;
/**
 * Adds file meta
 */
const meta = ({ meta, options }) => {
    const sourcePrefix = options.sourcePrefix || "src/";
    const moduleName = meta.filename.substring(meta.filename.indexOf(sourcePrefix) + sourcePrefix.length, meta.filename.length - 3);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVzZXRzL21ldGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUE7O0dBRUc7QUFDSSxNQUFNLElBQUksR0FBc0MsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO0lBQzNFLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFBO0lBQ25ELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDL0gsTUFBTSxlQUFlLEdBQUcsc0NBQXNDLFVBQVUsS0FBSyxDQUFBO0lBRTdFLElBQUksQ0FBQztRQUNILElBQUksZUFBZSxLQUFLLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUM3QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDOUIsQ0FBQztJQUNILENBQUM7SUFBQyxXQUFNLENBQUMsQ0FBQSxDQUFDO0lBRVYsT0FBTyxlQUFlLENBQUM7QUFDekIsQ0FBQyxDQUFDO0FBWlcsUUFBQSxJQUFJLFFBWWYifQ==