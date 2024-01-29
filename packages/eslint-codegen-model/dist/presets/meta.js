"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meta = void 0;
/**
 * Adds file meta
 */
const meta = ({ meta }) => {
    const moduleName = meta.filename.substring(meta.filename.indexOf("_src/") > -1 ? meta.filename.indexOf("_src/") + 5 : meta.filename.indexOf("src/") + 4, meta.filename.length - 3);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVzZXRzL21ldGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUE7O0dBRUc7QUFDSSxNQUFNLElBQUksR0FDWixDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtJQUNoQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDbEwsTUFBTSxlQUFlLEdBQUcsc0NBQXNDLFVBQVUsS0FBSyxDQUFBO0lBRTdFLElBQUksQ0FBQztRQUNILElBQUksZUFBZSxLQUFLLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUM3QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDOUIsQ0FBQztJQUNILENBQUM7SUFBQyxXQUFNLENBQUMsQ0FBQSxDQUFDO0lBRVYsT0FBTyxlQUFlLENBQUM7QUFDekIsQ0FBQyxDQUFDO0FBWlcsUUFBQSxJQUFJLFFBWWYifQ==