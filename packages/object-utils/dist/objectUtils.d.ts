/**
 * Recursively clones an object, optionally substituting objects for arrays of keys or primitives for their types.
 *
 * @param object - The object to clone
 * @param options
 * @param options.keysOnly - Return arrays of keys in place of objects (default: false)
 * @param options.maxDepth - The maximum depth to traverse (default: Infinity)
 * @param options.typesOnly - Return types in place of primitives (default: false)
 *
 * @returns The cloned object
 */
declare function cloneDeep(object: any, options?: {}): {};
/**
 * Recursively merges arguments.
 *
 * @param args - Either an array of arrays or an array of objects to merge
 * @param options
 * @param options.treatObjectsAsNamedArrays - Whether to treat objects as named arrays (default: false)
 *
 * @returns The merged object
 */
declare function mergeDeep(args: any, options?: {}): any;
/**
 * Gets the key of the given object by a path.
 *
 * @param object - The object to traverse
 * @param path - An array of keys
 *
 * @returns The value of the object at the path
 */
declare function getKeyOfObjectByPath(object: any, path: any): any;
/**
 * Gets or creates the key of the given object by a path.
 *
 * @param object - The object to traverse
 * @param path - An array of keys
 *
 * @returns The value of the object at the path
 */
declare function getOrCreateKeyOfObjectByPath(object: any, path: any): any;

export { cloneDeep, getKeyOfObjectByPath, getOrCreateKeyOfObjectByPath, mergeDeep };
