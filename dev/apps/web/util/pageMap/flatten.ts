export function flattenPageMap(pageMap) {
	if (Array.isArray(pageMap)) {
		pageMap = { "children": pageMap };
	}

	const flattenedPageMap = [];

	(function recurse(node, path = []) {
		if (node.children !== undefined) {
			for (const element of node.children) {
				recurse(element, [...path, node.name]);
			}
		} else {
			flattenedPageMap.push(node);
		}
	})(pageMap);

	return flattenedPageMap;
}
