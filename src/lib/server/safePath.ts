import path from 'path';

export function safePath(pathIn: string, options: { base: string, noSubDir?: boolean }): string | null {
    const base = options.base.endsWith('/') ? options.base : options.base + '/';
    if (!pathIn.startsWith("./")) {
        pathIn = "./" + pathIn;
    }
    pathIn = path.join(base, pathIn);
    const normBase = path.normalize(base);
    const normPath = path.normalize(pathIn);
    console.log(normBase);
    console.log(normPath);

    if (normPath !== normBase && normPath.startsWith(normBase)) {
        if (options.noSubDir) {
            let rel = path.relative(normBase, normPath);
            if (rel.indexOf(path.sep) !== -1) {
                return null;
            }
        }
        return normPath;
    }
    return null;
}