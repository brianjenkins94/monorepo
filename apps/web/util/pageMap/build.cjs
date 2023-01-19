const { "promises": fs } = require("fs");
const path = require("path");

function getKeyOfObjectByPath(object, path) {
	return path.reduce(function(object, key) {
		if (!Object.hasOwn(object, key)) {
			throw new TypeError("Cannot read properties of undefined (reading '" + key + "')");
		}

		return object[key];
	}, object);
}

function peekTitle(node, name) {
	const metaNode = node.find(function(element) {
		return element["name"] === "meta.json";
	});

	return metaNode?.meta.find(function(element) {
		return element[name] !== undefined;
	})?.[name] ?? metaNode?.meta["index"];
}

async function build(directory, route = "") {
	const pageMap = [];

	for (const file of await fs.readdir(directory)) {
		const baseName = path.basename(file, path.extname(file));

		if ((await fs.stat(path.join(directory, file))).isDirectory()) {
			if (path.join(directory, file).replace(/\\+/gu, "/").endsWith("/api")) {
				continue;
			}

			pageMap.push({
				"name": baseName,
				"children": await build(path.join(directory, file), route + "/" + baseName),
				"route": route + "/" + baseName
			});
		} else {
			if (path.extname(file).toLowerCase() === ".mdx") {
				pageMap.push({
					"name": baseName,
					"route": route + (baseName !== "index" ? "/" + baseName : "")
				});
			} else if (file === "meta.json") {
				pageMap.push({
					"name": file,
					"meta": JSON.parse("[" + (await fs.readFile(path.join(directory, file), { "encoding": "utf8" })).replace(/,$/gmu, "\n},\n{") + "]")
				});
			}
		}
	}

	return pageMap;
}

function entitle(pageMap) {
	for (const rootNode of pageMap) {
		if (rootNode.children === undefined || (Array.isArray(rootNode.children) && rootNode.children.length === 0)) {
			continue;
		}

		(function recurse(node, path = []) {
			if (node.name === "meta.json") {
				return;
			}

			if (node.children !== undefined) {
				for (let index = 0, element = node.children[index]; index < node.children.length; index++, element = node.children[index]) {
					recurse(element, [...path, "children", index]);
				}
			}

			if (path.length === 0) {
				return;
			}

			const lastKey = path.pop();

			const parentNode = getKeyOfObjectByPath(rootNode, path);

			const title = peekTitle(parentNode, node.name);

			if (title !== undefined) {
				parentNode[lastKey] = {
					...parentNode[lastKey],
					"name": node.name,
					"route": node.route,
					"title": title
				};
			}
		})(rootNode);
	}
}

function order(pageMap) {
	for (const rootNode of pageMap) {
		if (rootNode.children === undefined || (Array.isArray(rootNode.children) && rootNode.children.length === 0)) {
			continue;
		}

		(function recurse(node, path = []) {
			if (node.name === "meta.json") {
				return;
			}

			// Traverse

			if (node.children !== undefined) {
				for (let index = 0, element = node.children[index]; index < node.children.length; index++, element = node.children[index]) {
					recurse(element, [...path, "children", index]);
				}
			}

			// Sort

			const lastKey = path.pop();

			const parentNode = getKeyOfObjectByPath(rootNode, path);

			if (!Array.isArray(parentNode)) {
				return;
			}

			const order = parentNode.find(function(element) {
				return element.name === "meta.json";
			})?.meta.map(function(element) {
				return Object.keys(element)[0];
			});

			if (order === undefined) {
				return;
			}

			const sortByObject = order.reduce(function(previous, current, index) {
				if (previous[current] !== undefined) {
					return previous;
				}

				return {
					...previous,
					[current]: index
				};
			}, {
				"index": -Infinity,
				"meta.json": Infinity
			});

			parentNode.sort(function(a, b) {
				return sortByObject[a.name] - sortByObject[b.name];
			});
		})(rootNode);
	}
}

function trim(pageMap) {
	for (let index = 0, rootNode = pageMap[index]; index < pageMap.length; index++, rootNode = pageMap[index]) {
		if (rootNode.children === undefined || (Array.isArray(rootNode.children) && rootNode.children.length === 0)) {
			pageMap[index] = undefined;

			continue;
		}

		(function recurse(node, path = []) {
			if (node.name === "meta.json") {
				return;
			}

			// Traverse

			if (node.children !== undefined) {
				for (let index = 0, element = node.children[index]; index < node.children.length; index++, element = node.children[index]) {
					recurse(element, [...path, "children", index]);
				}
			}

			// Delete

			const lastKey = path.pop();

			const parentNode = getKeyOfObjectByPath(rootNode, path);

			if (!Array.isArray(parentNode)) {
				return;
			}

			const metaIndex = parentNode.findIndex(function(element) {
				return element.name === "meta.json";
			});

			if (metaIndex !== -1) {
				parentNode.splice(metaIndex, 1);
			}
		})(rootNode);

		pageMap[index] = (function recurse(node, path = []) {
			const pageMaps = []

			for (const child of node.children) {
				if (child.name === "docs" && child.children.length > 0) {
					pageMaps.push(child);
				} else if (child.children !== undefined) {
					pageMaps.push(...recurse(child, [...path, node.name]));
				}
			}

			return pageMaps;
		})(rootNode);
	}

	return pageMap.filter(function(element) {
		return element !== undefined && (Array.isArray(element) && element.length > 0);
	}).flat();
}

async function buildPageMap(directory) {
	const pageMap = await build(directory);

	entitle(pageMap);

	order(pageMap);

	return trim(pageMap);
}

module.exports = {
	"buildPageMap": buildPageMap
};
