export interface EnforceSingleVersionSettings {
    lookForSingleton?: boolean;
    specificPackages?: string[];
}
export declare function makeHooks(settings?: EnforceSingleVersionSettings): {
    afterAllResolved: (lockfile: any, context: any) => any;
    readPackage: (pkg: {
        name: string;
        singleton?: boolean;
    }, context: any) => {
        name: string;
        singleton?: boolean | undefined;
    };
};
//# sourceMappingURL=plugin.d.ts.map