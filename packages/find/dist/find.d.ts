import { GlobOptions } from 'glob/dist/mjs/glob';

declare class Find {
    private glob;
    constructor(pathOrObject: object | string, pattern: string[] | string, options?: GlobOptions);
    exec(functionOrShellCommand: any): string[];
    private cacheify;
}
declare function find(pathOrObject: object | string, pattern: string[] | string, options?: GlobOptions): Find;

export { find };
