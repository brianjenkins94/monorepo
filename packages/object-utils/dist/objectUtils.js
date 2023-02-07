// objectUtils.ts
function cloneDeep(object, options = {}) {
  options["keysOnly"] ??= false;
  options["maxDepth"] ??= Infinity;
  options["typesOnly"] ??= false;
  if (options["typesOnly"] === true) {
    options["keysOnly"] = false;
  }
  return function recurse(object2, depth = 0) {
    if (depth >= options["maxDepth"]) {
      if (Array.isArray(object2)) {
        return [];
      } else if (typeof object2 === "object" && object2 !== null) {
        return {};
      } else {
        return null;
      }
    }
    depth += 1;
    const clone = options["keysOnly"] ? [] : {};
    if (object2 === null) {
      return clone;
    }
    for (const [key, value] of Object.entries(object2)) {
      if (Array.isArray(value)) {
        if (options["keysOnly"] === true) {
          const object3 = {};
          if (typeof value[0] === "object") {
            for (const element of value) {
              object3[key] = mergeDeep([object3[key], cloneDeep(element, { "keysOnly": true })], { "treatObjectsAsNamedArrays": true });
            }
          } else {
            object3[key] = [];
          }
          clone.push(object3);
        } else if (options["typesOnly"] === true) {
          for (const element of value) {
            if (typeof element === "object" && element !== null) {
              clone[key] = recurse(element, depth);
            }
          }
        } else {
          clone[key] = [];
          for (const element of value) {
            if (typeof element === "object" && element !== null) {
              clone[key].push(recurse(element, depth));
            } else {
              clone[key].push(element);
            }
          }
        }
      } else if (typeof value === "object" && value !== null) {
        if (options["keysOnly"] === true) {
          const object3 = {};
          object3[key] = recurse(value, depth);
          clone.push(object3);
        } else {
          clone[key] = recurse(value, depth);
        }
      } else if (options["keysOnly"] === true) {
        clone.push(key);
      } else if (options["typesOnly"] === true && value !== null) {
        clone[key] = typeof value;
      } else {
        clone[key] = value;
      }
    }
    return clone;
  }(object);
}
function mergeDeep(args, options = {}) {
  options["treatObjectsAsNamedArrays"] ??= false;
  function objectify(array) {
    return function recurse(object) {
      const clone = {};
      for (const element of object) {
        if (Array.isArray(element)) {
          throw new Error("This should never happen. / Not yet implemented?");
        } else if (typeof element === "object" && element !== null) {
          const [key] = Object.keys(element);
          if (options["treatObjectsAsNamedArrays"] === true) {
            clone[key] = recurse(element[key]);
          } else {
            throw new Error("Not yet implemented.");
          }
        } else {
          clone[element] = "";
        }
      }
      return clone;
    }(array);
  }
  function merge(target, source) {
    if (target === void 0) {
      target = Array.isArray(source) ? [] : {};
    }
    for (const [key, value] of Object.entries(source)) {
      if (Array.isArray(value)) {
        for (const [key2, value2] of Object.entries(source)) {
          const [subkey] = Object.keys(value2);
          const object = {};
          object[subkey] = [];
          for (const element of value2[subkey]) {
            object[subkey].push(element);
          }
          if (object[subkey].length !== 0) {
            target[key2] = object;
          }
        }
      } else if (typeof value === "object" && value !== null) {
        target[key] = merge(target[key], value);
      } else {
        target[key] = value;
      }
    }
    return target;
  }
  return args.reduce(function(previous, current) {
    if (previous === void 0) {
      previous = Array.isArray(current) ? [] : {};
    }
    if (Array.isArray(previous) && Array.isArray(current)) {
      previous = cloneDeep(mergeDeep([objectify(previous), objectify(current)]), { "keysOnly": true });
    } else {
      merge(previous, current);
    }
    return previous;
  });
}
function getKeyOfObjectByPath(object, path) {
  return path.reduce(function(object2, key) {
    return object2[key];
  }, object) || object;
}
function getOrCreateKeyOfObjectByPath(object, path) {
  return path.reduce(function(object2, key) {
    if (object2[key] === void 0) {
      object2[key] = {};
    }
    return object2[key];
  }, object) || object;
}
export {
  cloneDeep,
  getKeyOfObjectByPath,
  getOrCreateKeyOfObjectByPath,
  mergeDeep
};
