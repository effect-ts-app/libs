export function makeHooks(settings) {
    const foundPackages = [];
    const lookForSingleton = settings?.lookForSingleton ?? true;
    function readPackage(pkg, context) {
        if ((lookForSingleton && pkg["singleton"]) || settings?.specificPackages?.includes(pkg.name)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vX3NyYy9wbHVnaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsTUFBTSxVQUFVLFNBQVMsQ0FBQyxRQUF1QztJQUMvRCxNQUFNLGFBQWEsR0FBYSxFQUFFLENBQUE7SUFDbEMsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLEVBQUUsZ0JBQWdCLElBQUksSUFBSSxDQUFBO0lBQzNELFNBQVMsV0FBVyxDQUFDLEdBQTBDLEVBQUUsT0FBWTtRQUMzRSxJQUFJLENBQUMsZ0JBQWdCLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksUUFBUSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDNUYsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDcEMsT0FBTyxHQUFHLENBQUE7YUFDWDtZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxDQUFBO1lBQ3RELGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQzdCO1FBQ0QsT0FBTyxHQUFHLENBQUE7SUFDWixDQUFDO0lBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxRQUFhLEVBQUUsT0FBWTtRQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUE7UUFDMUMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDbkQsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFBO1FBQzlCLE1BQU0sS0FBSyxHQUEyQixFQUFFLENBQUE7UUFDeEMsS0FBSyxNQUFNLENBQUMsSUFBSSxZQUFZLEVBQUU7WUFDNUIsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN4QixLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQy9CO1NBQ0Y7UUFDRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUE7UUFDWixLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRTtZQUNyQixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFFLENBQUE7WUFDdkIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO2dCQUNiLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxLQUFLLFVBQVUsQ0FBQTthQUNyQztTQUNGO1FBQ0QsSUFBSSxHQUFHLEVBQUU7WUFDUCxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQ3JCO1FBQ0QsT0FBTyxRQUFRLENBQUE7SUFDakIsQ0FBQztJQUVELE9BQU87UUFDTCxnQkFBZ0I7UUFDaEIsV0FBVztLQUNaLENBQUE7QUFDSCxDQUFDIn0=