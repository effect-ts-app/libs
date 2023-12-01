/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EnforceSingleVersionSettings {
  lookForSingleton?: boolean // defaults to true
  specificPackages?: string[]
}

export function makeHooks(settings?: EnforceSingleVersionSettings) {
  const foundPackages: string[] = []
  const lookForSingleton = settings?.lookForSingleton ?? true
  function readPackage(pkg: { name: string; singleton?: boolean }, context: any) {
    if ((lookForSingleton && pkg["singleton"]) || settings?.specificPackages?.includes(pkg.name)) {
      if (foundPackages.includes(pkg.name)) {
        return pkg
      }
      context.log(`Adding ${pkg.name} as singleton package`)
      foundPackages.push(pkg.name)
    }
    return pkg
  }

  function afterAllResolved(lockfile: any, context: any) {
    context.log(`Checking duplicate packages`)
    const packagesKeys = Object.keys(lockfile.packages)
    const packages = foundPackages
    const found: Record<string, number> = {}
    for (const p of packagesKeys) {
      if (packages.includes(p)) {
        found[p] = (found[p] || 0) + 1
      }
    }
    let msg = ""
    for (const p in found) {
      const count = found[p]!
      if (count > 1) {
        msg += `${p} found ${count} times\n`
      }
    }
    if (msg) {
      throw new Error(msg)
    }
    return lockfile
  }

  return {
    afterAllResolved,
    readPackage
  }
}
