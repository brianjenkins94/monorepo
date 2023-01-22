import { getKeyOfObjectByPath } from "object-utils";

function interpolateArray() {

}

/* function interpolateObject(template, data = {}) {
	(function recurse(object, path = []) {
		if (Array.isArray(object)) {
			for (let x = 0; x < object.length; x++) {
				recurse(object[x], [...path, x]);
			}
		} else if (typeof object === "object" && object !== null) {
			for (const [key, value] of Object.entries(object)) {
				if (key === "id") {
					delete getKeyOfObjectByPath(collection, path)[key];
				} else if (key === "event") {
					getKeyOfObjectByPath(collection, path)[key] = [];
				} else if (typeof object === "object" && object !== null) {
					recurse(value, [...path, key]);
				}
			}
		}
	})(template);
}

function interpolateString(template, data = {}) {
	return template.replace(/{([^${]+)}/gu, function(_, key) {
		return data[key];
	});
}

export function interpolate(template, data = {}) {
	switch (typeof template) {
		case "object":
			return Array.isArray(template) ? interpolateArray(template, data) : interpolateObject(template, data);
		case "string":
			return interpolateString(template, data);
		default:
			throw new Error("Unrecognized template type.");
	}
} */
