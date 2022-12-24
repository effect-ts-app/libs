"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeHooks = makeHooks;
function makeHooks(settings) {
  const foundPackages = [];
  const lookForSingleton = settings?.lookForSingleton ?? true;
  function readPackage(pkg, context) {
    if (lookForSingleton && pkg["singleton"] || settings?.specificPackages?.includes(pkg.name)) {
      if (foundPackages.includes(pkg.name)) {
        return pkg;
      }
      context.log(`Adding ${pkg.name} as singleton package`);
      foundPackages.push(pkg.name);
    }
    return pkg;
  }
  function afterAllResolved(lockfile, context) {
    context.log(`Checking duplicate packages`);
    const packagesKeys = Object.keys(lockfile.packages);
    const packages = foundPackages;
    const found = {};
    for (const p of packagesKeys) {
      if (packages.includes(p)) {
        found[p] = (found[p] || 0) + 1;
      }
    }
    let msg = "";
    for (const p in found) {
      const count = found[p];
      if (count > 1) {
        msg += `${p} found ${count} times\n`;
      }
    }
    if (msg) {
      throw new Error(msg);
    }
    return lockfile;
  }
  return {
    afterAllResolved,
    readPackage
  };
}
//# sourceMappingURL=plugin.cjs.map