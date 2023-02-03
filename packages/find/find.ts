/* eslint @typescript-eslint/typedef: "error" */
/* eslint @typescript-eslint/explicit-function-return-type: "error" */
/* eslint @typescript-eslint/explicit-module-boundary-types: "error" */

import { glob, Glob } from "glob";
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
		if (typeof pathOrObject === "string") {
			options.cwd ??= pathOrObject;
		} else {
			options.cwd = "/";
			options.cache = this.cacheify(pathOrObject);
		}

		this.glob = new Glob(pattern, options);
	}

	public exec(functionOrShellCommand): string[] {
		return this.glob.process();
	}

	private cacheify(object): GlobCache {
		const cache = {};

		(function recurse(object): void {

		})(object);

		return cache;
	}
}

export function find(pathOrObject: object | string, pattern: string[] | string, options: GlobOptions = {}): Find {
	const find = new Find(pathOrObject, pattern, options);

	return find;
}

console.log(glob("**/*.js"));

const object = {
	"foo": {
		"bar": {
			"baz": {}
		}
	},
	"bar": [],
	"baz": 7
};

//console.log(find(object, "**/bar"));
