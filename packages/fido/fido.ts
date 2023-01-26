import Bottleneck from "bottleneck/light";
import * as util from "util";
// Test
// 100 requests/10 seconds
const limiter = new Bottleneck({
	"reservoir": 100,
	"reservoirRefreshAmount": 100,
	"reservoirRefreshInterval": 10_0000
});

limiter.on("failed", function(error, { retryCount }) {
	if (retryCount < 2) {
		return (2 ** (retryCount + 1)) * 1000;
	}

	return undefined;
});

function flush(buffer, callback) {
	for (let x = 0; x < buffer.length; x++) {
		if (x % 2 === 0) {
			callback("--> " + buffer[x].join("\n--> "));
		} else {
			callback("\n<-- " + buffer[x].join("\n<-- ") + "\n");
		}
	}
}

let SaxesParser;

// FROM: https://github.com/tomas/needle/blob/cfc51beac3c209d7eeca2f1ba546f67d9aa780ea/lib/parsers.js#L9
async function parseXml(xmlString) {
	const parser = new SaxesParser();

	return new Promise(function(resolve, reject) {
		let object;
		let current;

		parser.on("error", function(error) {
			reject(error);
		});

		parser.on("text", function(text) {
			if (current !== undefined) {
				current.value += text;
			}
		});

		parser.on("opentag", function({ name, attributes }) {
			const element = {
				"name": name ?? "",
				"value": "",
				"attributes": attributes
			};

			if (current !== undefined) {
				element["parent"] = current;

				current["children"] ??= [];

				current.children.push(element);
			} else {
				object = element;
			}

			current = element;
		});

		parser.on("closetag", function() {
			if (current.parent !== undefined) {
				const previous = current;

				current = current.parent;

				delete previous.parent;
			}
		});

		parser.on("end", function() {
			resolve(object);
		});

		parser.write(xmlString).close();
	});
}

async function attemptParse(response: Response): Promise<any> {
	let body;

	if (/\bjson\b/iu.test(response.headers?.get("Content-Type"))) {
		try {
			body = response.json();
		} catch (error) { }
	} else if (SaxesParser !== null && /^text|.*?(ht|x)ml/iu.test(response.headers?.get("Content-Type"))) {
		try {
			SaxesParser ??= (await import("saxes"))["SaxesParser"];

			body = parseXml(await response.text());
		} catch (error) {
			SaxesParser = null;
		}
	}

	return body;
}

function extendedFetch(url, options) {
	return new Promise(function retry(resolve, reject) {
		const requestBuffer = [];

		if (options["debug"]) {
			requestBuffer.push(options.method.toUpperCase() + " " + url);
		}

		if (options["headers"]?.["Content-Type"] !== undefined) {
			if (options["debug"]) {
				for (const header of ["Content-Type"]) {
					if (options.headers[header] !== undefined) {
						requestBuffer.push(header + ": " + options.headers[header]);
					}
				}
			}

			if (/\bjson\b/iu.test(options["headers"]["Content-Type"]) && typeof options.body === "object") {
				if (options["debug"]) {
					requestBuffer.push(...util.inspect(options.body, { "compact": false }).split("\n"));
				}

				options.body = JSON.stringify(options.body);
			}
		}

		limiter.schedule(function() {
			const responseBuffer = [];

			return fetch(url, options)
				.then(async function(response) {
					if (options["debug"]) {
						responseBuffer.push("HTTP " + String(response.status) + " " + response.statusText);

						for (const header of ["Content-Length", "Content-Type", "Server", "X-Powered-By"]) {
							if (response.headers.has(header)) {
								responseBuffer.push(header + ": " + response.headers.get(header));
							}
						}
					}

					if (response.status >= 400 && response.status < 500 && options.method === "get") {
						responseBuffer.push("Request failed with " + String(response.status) + " " + response.statusText + ". Retrying...");

						throw new Error();
					} else {
						const body = await attemptParse(response);

						if (body !== undefined) {
							responseBuffer.push(...util.inspect(body, { "compact": false }).split("\n"));
						}

						resolve({
							"response": response,
							"body": body
						});
					}

					flush([requestBuffer, responseBuffer], console.log);
				})
				.catch(function(error) {
					if (options["debug"]) {
						responseBuffer.push(error.cause.toString());
					}

					flush([requestBuffer, responseBuffer], console.log);

					throw new Error(error);
				});
		});
	});
}

interface Fido {
	get?: (url: string, query?: any, object?: any) => Promise<{ response: Response; body: any }>;
	post?: (url: string, query?: any, object?: any) => Promise<{ response: Response; body: any }>;
	put?: (url: string, query?: any, object?: any) => Promise<{ response: Response; body: any }>;
	delete?: (url: string, query?: any, object?: any) => Promise<{ response: Response; body: any }>;
	poll?: (url: string, query?: any, object?: any, condition?: (response: Response, body: any) => Promise<boolean>) => Promise<{ response: Response; body: any }>;
}

export const fido: Fido = {};

for (const method of ["get", "post", "put", "delete"]) {
	fido[method] = async function(url, query = {}, options = {}) {
		url = new URL(url);

		if (!Object.values(query).every(function(value) { return typeof value !== "object"; })) {
			options = query;
			query = {};
		}

		query = {
			...Object.fromEntries(new URLSearchParams(url.search)),
			...query
		};

		if (Object.entries(query).length > 0) {
			url.search = new URLSearchParams(query);
		}

		if (options["body"] !== undefined) {
			if (method === "get") {
				throw new Error("That's illegal.");
			} else if (options["headers"]?.["Content-Type"] === undefined) {
				throw new Error("`Content-Type` is required when providing a payload.");
			}
		}

		// @ts-expect-error
		const { response, body }: Response = await extendedFetch(new URL(url).toString(), {
			...options,
			"debug": options["debug"] ?? process.env["NODE_ENV"] !== "production",
			"method": method
		});

		return {
			"response": response,
			"body": body
		};
	};
}

fido.poll = function(url, query = {}, options = {}, condition: (response: Response, body) => Promise<boolean> = async function(response, body) { return Promise.resolve(response.ok); }): Promise<{ response: Response; body: any }> {
	// @ts-expect-error
	url = new URL(url);

	if (typeof query === "function") {
		condition = query;
		query = {};
		options = {};
	} else if (typeof options === "function") {
		condition = options;
		options = {};
	}

	if (!Object.values(query).every(function(value) { return typeof value !== "object"; })) {
		options = query;
		query = {};
	}

	query = {
		// @ts-expect-error
		...Object.fromEntries(new URLSearchParams(url.search)),
		...query
	};

	if (Object.entries(query).length > 0) {
		// @ts-expect-error
		url.search = new URLSearchParams(query);
	}

	if (options["body"] !== undefined) {
		throw new Error("That's illegal.");
	}

	return new Promise(async function(resolve, reject) {
		// @ts-expect-error
		const { response, body }: Response = await fido.get(new URL(url).toString(), options);

		if (await condition(response, body)) {
			resolve({
				"response": response,
				"body": body
			});
		} else {
			throw new Error();
		}
	});
};
