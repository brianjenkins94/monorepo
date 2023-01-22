// @ts-nocheck

/* eslint-disable complexity */

function cloneDeep(object) {
	if (typeof object !== "object" || object === null) {
		return object;
	}

	const clone = Array.isArray(object) ? [] : {};

	for (const [key, value] of Object.entries(object)) {
		if (Array.isArray(value)) {
			clone[key] = [];

			for (const element of value) {
				if (typeof element === "object" && element !== null) {
					clone[key].push(cloneDeep(element));
				} else {
					clone[key].push(element);
				}
			}
		} else if (typeof value === "object" && value !== null) {
			clone[key] = cloneDeep(value);
		} else {
			clone[key] = value;
		}
	}

	return clone;
}

function getOrCreateKeyOfObjectByPath(object, path) {
	return path.reduce(function(object, key) {
		if (object[key] === undefined) {
			object[key] = {};
		}

		return object[key];
	}, object);
}

function getKeyOfObjectByPath(object, path) {
	return path.reduce(function(object, key) {
		if (!Object.prototype.hasOwnProperty.call(object, key)) {
			throw new TypeError("Cannot read properties of undefined (reading '" + key + "')");
		}

		return object[key];
	}, object);
}

class Juvy {
	private static readonly BUILT_INS = {
		"Array": Array,
		"Boolean": Boolean,
		"Number": Number,
		"Object": Object,
		"RegExp": RegExp,
		"String": String
	};
	private readonly _schema = {
		"_juvyProperties": {}
	};
	private readonly _env = {};
	private readonly _argv = {};
	private readonly _instance = {};
	private readonly options = {};
	private readonly types = {
		"*": function() { },
		"int": function(x) {
			console.assert(Number.isInteger(x), "must be an integer");
		},
		"integer": function(x) {
			console.assert(Number.isInteger(x), "must be an integer");
		},
		"nat": function(x) {
			console.assert(Number.isInteger(x) && x >= 0, "must be a positive integer");
		},
		"port": function(x) {
			console.assert(Number.isInteger(x) && x >= 0 && x <= 65535, "ports must be within range 0 - 65535");
		}
	};

	public constructor(def, options = { "strict": true }) {
		this.options["strict"] = options["strict"] ?? true;

		for (const [key, value] of Object.entries(def)) {
			const { types } = this;
			// ???
			(function normalizeSchema(key, value, props, fullName, env, argv) {
				if (key === "_juvyProperties") {
					throw new Error("'" + fullName + "': `_juvyProperties` is reserved word of juvy.");
				}

				// If the current schema node is not a config property (has no "default"), recursively normalize it.
				if (typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length > 0 && !("default" in value)) {
					props[key] = {
						"_juvyProperties": {}
					};

					Object.keys(value).forEach(function(k) {
						normalizeSchema(k, value[k], props[key]._juvyProperties, fullName + "." + k, env, argv);
					});

					return;
				} else if (typeof value !== "object" || Array.isArray(value) || value === null || Object.keys(value).length === 0) {
					// Normalize shorthand "value" config properties
					value = { "default": value };
				}

				const o = cloneDeep(value);
				props[key] = o;

				// Associate this property with an environmental variable
				if (o.env) {
					if (!env[o.env]) {
						env[o.env] = [];
					}

					env[o.env].push(fullName);
				}

				// Associate this property with a command-line argument
				if (o.arg) {
					argv[o.arg] = fullName;
				}

				// store original format function
				const format = o.format;
				let newFormat;

				if (Object.keys(Juvy.BUILT_INS).includes(format) || Object.values(Juvy.BUILT_INS).includes(format)) {
					// If the format property is a built-in JavaScript constructor,
					// assert that the value is of that type
					const Format = typeof format === "string" ? Juvy.BUILT_INS[format] : format;

					newFormat = function(x) {
						console.assert(Object.prototype.toString.call(x) === Object.prototype.toString.call(new Format()), "must be of type " + Format.name);
					};

					o.format = Format.name.toLowerCase();
				} else if (typeof format === "string") {
					// Store declared type
					if (!types[format]) {
						throw new Error("'" + fullName + "' uses an unknown format type: " + format);
					}

					// Use a predefined type
					newFormat = types[format];
				} else if (Array.isArray(format)) {
					// Assert that the value is a valid option
					newFormat = (function contains(options, x) {
						console.assert(options.indexOf(x) !== -1, "must be one of the possible values: " + JSON.stringify(options));
					}).bind(null, format);
				} else if (typeof format === "function") {
					newFormat = format;
				} else if (format && typeof format !== "function") {
					throw new Error("'" + fullName + "': `format` must be a function or a known format type.");
				}

				if (!newFormat && !format) {
					// Default format is the typeof the default value
					const type = Object.prototype.toString.call(o.default);

					newFormat = function(x) {
						console.assert(Object.prototype.toString.call(x) === type, " should be of type " + type.replace(/\[.* \]/gu, ""));
					};
				}

				o._format = function(x) {
					// Accept null if allowed before calling any format function
					if (this.nullable && x === null) {
						return;
					}

					try {
						newFormat(x, this);
					} catch (e) {
						// Attach the value and the property's fullName to the error
						e.fullName = fullName;
						e.value = x;
						throw e;
					}
				};
			})(key, value, this._schema._juvyProperties, key, this._env, this._argv);
		}

		// ???
		(function addDefaultValues(schema, c, instance) {
			for (const [key, value] of Object.entries(schema._juvyProperties)) {
				if (value["_juvyProperties"]) {
					const kids = c[key] || {};

					addDefaultValues(value, kids, instance);

					c[key] = kids;
				} else {
					c[key] = Juvy.coerce(key, cloneDeep(value["default"]), schema);
				}
			}
		})(this._schema, this._instance, this);

		Juvy.importEnvironment(this);
		Juvy.importArguments(this);
	}

	// ???
	private static coerce(path, value, schema) {
		const ar = path.split(".");
		let o = schema;

		while (ar.length > 0) {
			const k = ar.shift();
			if (o?._juvyProperties?.[k]) {
				o = o._juvyProperties[k];
			} else {
				o = null;
				break;
			}
		}

		let format;

		if (o === null || o === undefined) { // added || === undefined
			format = null;
		} else if (typeof o.format === "string") {
			format = o.format;
		} else if (o.default !== null && o.default !== undefined) { // added && !== undefined
			format = typeof o.default;
		} else {
			format = null;
		}

		if (typeof value === "string") {
			switch (format) {
				case "int":
				case "integer":
				case "nat":
				case "port":
					value = parseInt(value);
					break;
				case "number":
					value = parseFloat(value);
					break;
				case "boolean":
					value = String(value).toLowerCase() !== "false";
					break;
				case "array":
					value = value.split(",");
					break;
				case "object":
					value = JSON.parse(value);
					break;
				case "regexp":
					value = new RegExp(value, "u");
					break;
				default:
				//console.warn("No match for format: `" + format + "`");
			}
		}

		return value;
	}

	private static importEnvironment(o) {
		const env = process.env;

		for (const [key, value] of Object.entries(o._env)) {
			if (env[key] !== undefined) {
				for (const k of value) {
					o.set(k, env[key]);
				}
			}
		}
	}

	private static importArguments(o) {
		const argv = (function parseArgs(args) {
			const argv = {};

			args = args.join(" ").match(/-(.*?)(?= +-|$)/gu) || [];

			for (let x = 0; x < args.length; x++) {
				const arg = args[x];

				if (arg[1] !== "-") {
					for (const shorthand of arg.substring(1).split("")) {
						argv[shorthand] = true;
					}

					continue;
				} else if (arg.length === 2) {
					break;
				}

				const value = arg.split(/ +|=/u);
				const key = value.shift().replace(/^-+/u, "");

				argv[key] = value.join(" ") ?? (args[x + 1] === undefined || args[x + 1].startsWith("-") || args[x + 1]);
			}

			return argv;
		})(process.argv);

		for (const [key, value] of Object.entries(o._argv)) {
			if (argv[key] !== undefined) {
				o.set(value, String(argv[key]));
			}
		}
	}

	public getProperties() {
		return cloneDeep(this._instance);
	}

	public getSchema() {
		return JSON.parse(JSON.stringify(this._schema));
	}

	public get(path) {
		return cloneDeep(getKeyOfObjectByPath(this._instance, path.split(".")));
	}

	public default(path) {
		path = (path.split(".").join("._juvyProperties.") + ".default").split(".");

		return cloneDeep(getKeyOfObjectByPath(this._schema._juvyProperties, path));
	}

	public reset(name) {
		this.set(name, this.default(name));
	}

	public has(path) {
		return Object.keys(this.getProperties()).includes(path);
	}

	public set(name, value) {
		value = Juvy.coerce(name, value, this._schema);

		const parent = name.split(".");
		const child = parent.pop();

		if (parent !== "__proto__" && parent !== "constructor" && parent !== "prototype") {
			getOrCreateKeyOfObjectByPath(this._instance, parent)[child] = value;
		}

		return this;
	}

	public load(conf) {
		this.overlay(conf, this._instance, this._schema);

		// Environment and arguments always overrides config files
		Juvy.importEnvironment(this);
		Juvy.importArguments(this);

		return this;
	}

	// ???
	public overlay(from, to, schema) {
		for (const key of Object.keys(from)) {
			// Leaf
			if (Array.isArray(from[key]) || !(typeof from[key] === "object" && from[key] !== null) || !schema || schema.format === "object") {
				to[key] = Juvy.coerce(key, from[key], schema);
			} else {
				if (!(typeof to[key] === "object" && to[key] !== null)) {
					to[key] = {};
				}

				this.overlay(from[key], to[key], schema._juvyProperties[key]);
			}
		}
	}

	// ???
	public validate(options = this.options) {
		function flatten(obj, useProperties) {
			let key;

			const entries = [];

			for (const stack = Object.keys(obj); stack.length > 0;) {
				key = stack.shift();

				let value = getKeyOfObjectByPath(obj, key.split("."));

				if (typeof value === "object" && !Array.isArray(value) && value !== null && value !== undefined) { // added && !== undefined
					if (useProperties) {
						if ("_juvyProperties" in value) {
							value = value._juvyProperties;

							key += "._juvyProperties";
						} else {
							entries.push([key, value]);

							continue;
						}
					}

					const subkeys = Object.keys(value);

					// Don't filter out empty objects
					if (subkeys.length > 0) {
						for (const subkey of subkeys) {
							stack.push(key + "." + subkey);
						}

						continue;
					}
				}

				entries.push([key, value]);
			}

			const flattened = {};

			for (let [key, value] of entries) {
				if (useProperties) {
					key = key.replace(/\._juvyProperties/gu, "u");
				}

				flattened[key] = value;
			}

			return flattened;
		}

		const flatInstance = flatten(this._instance);
		const flatSchema = flatten(this._schema._juvyProperties, true);

		for (const name of Object.keys(flatSchema)) {
			const schemaItem = flatSchema[name];
			let instanceItem = flatInstance[name];

			if (!(name in flatInstance)) {
				try {
					if (typeof schemaItem.default === "object" && !Array.isArray(schemaItem.default)) {
						// Missing item may be an object with undeclared children, so try to
						// pull it unflattened from the config instance for type validation
						instanceItem = getKeyOfObjectByPath(this._instance, name.split("."));
					} else {
						throw new Error("missing");
					}
				} catch (e) {
					const err = new Error("configuration param '" + name + "' missing from config, did you override its parent?");

					//errors.missing.push(err)

					return;
				}
			}

			delete flatInstance[name];

			// Ignore nested keys of schema `object` properties
			if (schemaItem.format === "object" || typeof schemaItem.default === "object") {
				const keys = Object.keys(flatInstance).filter(function(key) {
					return key.lastIndexOf(name + ".", 0) === 0;
				});

				for (const key of keys) {
					delete flatInstance[key];
				}
			}

			if (typeof schemaItem.default !== undefined && instanceItem !== schemaItem.default) {
				try {
					schemaItem._format(instanceItem);
				} catch (err) {
					//errors.invalid_type.push(err)
				}
			}
		}

		if (options["strict"]) {
			for (const name of Object.keys(flatInstance)) {
				const err = new Error("configuration param '" + name + "' not declared in the schema");
				//errors.undeclared.push(err)
			}
		}

		return this;
	}
}

for (const method of [
	"addFormat",
	"addFormats",
	"addParser",
	"getArgs",
	"getEnv",
	"getSchemaString",
	"loadFile",
	"toString"
]) {
	Juvy[method] = function() {
		throw new Error("Removed");
	};
}

export function juvy(schema) {
	return new Juvy(schema);
}
