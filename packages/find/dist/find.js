// find.ts
import { glob, Glob } from "glob";
var Find = class {
  constructor(pathOrObject, pattern, options = {}) {
    if (typeof pathOrObject === "string") {
      options.cwd ?? (options.cwd = pathOrObject);
    } else {
      options.cwd = "/";
      options.cache = this.cacheify(pathOrObject);
    }
    this.glob = new Glob(pattern, options);
  }
  exec(functionOrShellCommand) {
    return this.glob.process();
  }
  cacheify(object) {
    const cache = {};
    (function recurse(object2) {
    })(object);
    return cache;
  }
};
function find(pathOrObject, pattern, options = {}) {
  const find2 = new Find(pathOrObject, pattern, options);
  return find2;
}
console.log(glob("**/*.js"));
export {
  find
};
