/* eslint @typescript-eslint/typedef: "error" */
/* eslint @typescript-eslint/explicit-function-return-type: "error" */
/* eslint @typescript-eslint/explicit-module-boundary-types: "error" */

import { Glob } from "glob";
import type { GlobCache } from "glob/dist/mjs/readdir";
import type { GlobOptions } from "glob/dist/mjs/glob";

enum DirentTypes {
	UV_DIRENT_FILE = 1,
	UV_DIRENT_DIR = 2
}

class Dirent extends null {
	public constructor(name, type: DirentTypes) {
		const dirent = Object.create(new.target.prototype);
		dirent.name = name;
		dirent[Symbol("type")] = type;

		// eslint-disable-next-line no-constructor-return
		return dirent;
	}
}

class Find {
	private glob;

	public constructor(pathOrObject: object | string, pattern: string[] | string, options: GlobOptions = {}) {
		options.ignore ??= "**/node_modules/**";

		if (typeof pathOrObject === "string") {
			options.cwd ??= pathOrObject;
		} else {
			options.cwd = "/";
			options.cache = this.cacheify(pathOrObject);
		}

		this.glob = new Glob(pattern, options);
	}

	public exec(functionOrShellCommand?): string[] {
		return this.glob.process();
	}

	private cacheify(object): GlobCache {
		const cache = {
			"/": []
		};

		if (typeof object === "object" && object !== null) {
			(function recurse(object, path = [""]): void {
				for (const [key, value] of Object.entries(object)) {
					if (Array.isArray(value)) {
						cache[[...path, key].join("/")] = Object.keys(value).map(function(value) {
							return new Dirent(value, DirentTypes.UV_DIRENT_FILE);
						});
					} else if (typeof value === "object" && value !== null) {
						cache[path.join("/") || "/"].push(new Dirent(key, DirentTypes.UV_DIRENT_DIR));

						cache[[...path, key].join("/")] ??= [];

						recurse(value, [...path, key]);
					} else {
						cache[path.join("/") || "/"].push(new Dirent(key, DirentTypes.UV_DIRENT_FILE));
					}
				}
			})(object);
		}

		return cache;
	}
}

export function find(pathOrObject: object | string, pattern: string[] | string, options: GlobOptions = {}): Find {
	const find = new Find(pathOrObject, pattern, options);

	return find;
}

//console.log(await find(".", "**/*.js").exec());

//const object = {
//  "foo": {
//      "bar": {
//          "baz": {}
//      },
//      "baz": 7
//  },
//  "bar": ["foo", "bar", "baz"],
//  "baz": 7
//};

//console.log(find(object, "**/bar"));
