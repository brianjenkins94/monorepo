import { existsSync, promises as fs } from "fs";
import * as path from "path";
import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import * as url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Rewrite (low priority) this using the regex sticky flag
function parse(template) {
	template = template
		.replace(/(?<!:)\/\/.*?$/gmu, "") // comments
		.replace(/\\/gu, "\\\\") // backslashes
		.replace(/"/gu, "\\\"") // double quotes
		.replace(/`/gu, "\\`") // backticks
		.replace(/\$\{/gu, "\\${"); // substitutions

	const buffer = [];

	const openTagRegex = /(.*?)<%\s*(=|-)?\s*/gsu;
	const closeTagRegex = /'|"|`|\/\*|(\s*%>)/gu;

	let index = 0;
	let match;

	while (match = openTagRegex.exec(template)) {
		index = match[0].length + match.index;
		const prefix = match[2] ?? "";

		buffer.push(match[1]);

		closeTagRegex.lastIndex = index;

		let closeTag;

		while (closeTag = closeTagRegex.exec(template)) {
			if (closeTag[1] !== undefined) {
				const value = template.substring(index, closeTag.index);

				index = closeTagRegex.lastIndex;
				openTagRegex.lastIndex = index;

				buffer.push({
					"type": {
						"": "execute",
						"-": "raw",
						"=": "interpolate"
					}[prefix],
					"value": value
				});

				break;
			}
		}
	}

	if (index < template.length) {
		buffer.push(template.substring(index));
	}

	return buffer;
}

function compile(nodes) {
	const buffer = ["const buffer = [];"];

	for (const node of nodes) {
		if (typeof node === "string") {
			buffer.push("buffer.push(`" + node + "`);");
		} else {
			let { type, value } = node;

			switch (type) {
				case "interpolate":
					if (/[&<>"']/gu.test(value)) {
						value = value.replace(/[&<>"']/gu, function(character) {
							return {
								"&": "&amp;",
								"<": "&lt;",
								">": "&gt;",
								"\"": "&quot;",
								"'": "&#39;"
							}[character];
						});
					}
				case "raw":
					buffer.push("buffer.push(`" + value + "`);");
					break;
				case "execute":
					buffer.push(value);
					break;
				default:
			}
		}
	}

	buffer.push("return buffer.join(\"\\n\");");

	return buffer.join("\n");
}

// All `extras` must receive `data` as their first argument
const extras = {
	"include": async function(data, file) {
		const basePath = path.join(__dirname, "..", "..", "views");
		const fullPath = path.join(basePath, file);

		if (path.resolve(fullPath).startsWith(basePath)) {
			if (existsSync(fullPath)) {
				if ((await fs.stat(fullPath)).isFile()) {
					return render(await fs.readdir(fullPath, { "encoding": "utf8" }), data);
				}
			}
		}
	}
};

function Head({ children }) {
	return children;
}

function Script(props) {
	return <script {...props}></script>;
}

function renderToString(element) {
	if (typeof element.type === "function") {
		// eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
		return (new Function(
			"React",
			"Head",
			"Script",
			element.type.toString().split("\n").slice(1, -1).join("\n")
		))(
			React,
			Head,
			Script
		);
	} else if (Array.isArray(element.props.children)) {
		// @ts-expect-error
		return ReactDOMServer.renderToString((function flattenHeads(nodes) {
			const elements = [];

			for (const node of nodes) {
				if (typeof node.type === "function") {
					if (node.type.name === "Head") {
						elements.push(...(Array.isArray(node.props.children) ? node.props.children : [node.props.children]));

						continue;
					} else if (node.type.name === "Script") {
						elements.push(<script {...node.props}></script>);

						continue;
					} else {
						elements.push(renderToString(node));
					}
				}

				elements.push(node);
			}

			return elements;
		})(element.props.children));
	} else {
		throw new Error("This should never happen.");
	}
}

export function render(template, data = {}) {
	if (typeof template !== "string") {
		return render("<html>" + renderToString(template) + "</html>", data);
	}

	// eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
	return new Function(...[
		...Object.keys(data),
		...Object.keys(extras),
		compile(parse(template))
	])(...[
		...Object.values(data),
		...Object.values(extras).map(function(extra: (...args) => string) {
			return function(...args) {
				return extra(data, ...args);
			};
		})
	]);
}
