// TODO: Rewrite (low priority)

export function innerText(jsx) {
	// Empty
	if (
		jsx === null ||
		typeof jsx === "boolean" ||
		typeof jsx === "undefined"
	) {
		return "";
	}

	// Numeric children
	if (typeof jsx === "number") {
		return jsx.toString();
	}

	// String literals
	if (typeof jsx === "string") {
		return jsx;
	}

	// Array of JSX
	if (Array.isArray(jsx)) {
		return jsx.reduce<string>(function(previous: string, current) {
			return previous + innerText(current);
		}, "");
	}

	// Children prop
	if (
		Object.hasOwn(jsx, "props") &&
		Object.hasOwn(jsx.props, "children")
	) {
		return innerText(jsx.props.children);
	}

	// Default
	return "";
}
