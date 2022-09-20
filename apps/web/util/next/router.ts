import { apiResolver } from "next/dist/server/api-utils/node"; // "next/dist/next-server/server/api-utils";
import { existsSync, promises as fs } from "fs";
import * as path from "path";
import * as url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { render } from "./renderer";

function processRouteLayer(routeHandlers) {
	const routes = [];

	for (const [pathName, routeHandler] of Object.entries(routeHandlers)) {
		routes.push({
			"type": "route",
			"name": pathName,
			"match": function(pathname) {
				// TODO: Improve?
				return new RegExp(pathName.replace(/\[.*?\]+/gu, "(.*)"), "u").test(pathname);
			},
			"fn": async function({ "originalRequest": request }, { "originalResponse": response }, _, parsedUrl) {
				response.render = async function(fileName, data) {
					if (typeof fileName !== "string") {
						response.send(render(fileName, data));

						return;
					}

					const file = path.join(__dirname, "..", "..", "views", fileName + ".ejs");

					if (existsSync(file)) {
						response.send(render(await fs.readFile(file, { "encoding": "utf8" }), data));
					} else {
						response.status(404);
					}
				};

				// @ts-expect-error
				await apiResolver(request, response, parsedUrl.query, function(request: NextApiRequest, response: NextApiResponse) {
					if (routeHandler[request.method.toLowerCase()] !== undefined) {
						routeHandler[request.method.toLowerCase()](request, response);
					} else {
						response.status(404);
					}
				});

				return { "finished": true };
			}
		});
	}

	return routes;
}

export async function routeify(routesDirectory) {
	const routes = [];

	await (async function breadthFirstSearch(queue) {
		const nextQueue = {};

		const routeLayer = {};

		for (const [directory, files] of Object.entries(queue)) {
			for (let file of files) {
				file = path.join(directory, file);

				const parsedPath = path.parse(file.substring(routesDirectory.length));
				let pathName = parsedPath.dir;

				if (parsedPath.name !== "index") {
					pathName = path.join(pathName, parsedPath.name);
				}

				pathName = pathName.replace(/\\+/gu, "/");

				if ((await fs.stat(file)).isDirectory()) {
					nextQueue[file] = await fs.readdir(file);
				} else {
					if (file.endsWith("_middleware.ts")) {
						throw new Error("Not yet implemented.");
					}

					routeLayer[pathName] = {};

					const routeHandler = await import(url.pathToFileURL(file).toString());

					for (const exportName of Object.keys(routeHandler)) {
						if (/middleware$/iu.test(exportName)) {
							throw new Error("Not yet implemented");
						}

						let method = (/^(?:connect|del(?:ete)?|get|head|options|patch|post|put|trace)/u.exec(exportName) || [])[0];

						if (method === undefined) {
							continue;
						}

						if (method === "del") {
							method = "delete";
						}

						routeLayer[pathName][method] = routeHandler[method];
					}
				}
			}
		}

		routes.push(...processRouteLayer(routeLayer));

		if (Object.keys(nextQueue).length > 0) {
			await breadthFirstSearch(nextQueue);
		}
	})({ [routesDirectory]: await fs.readdir(routesDirectory) });

	return routes;
}
