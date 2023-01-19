import { existsSync, promises as fs } from "fs";
import * as path from "path";
import * as url from "url";
import renderResult from "next/dist/server/render-result";
import type { NextServer } from "next/dist/server/next";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This shouldn't be necessary...
const RenderResult = renderResult["default"];

import { memoize } from "../memoize";

const basePath = path.join(__dirname, "..", "..");

const requestCache = {};

const routeCache = {};

export function getRequestHandler(app: NextServer) {
	const requestHandler = app.getRequestHandler();

	return async function(request, response) {
		const parsedUrl = url.parse(request.url, true);
		const { "pathname": pathName, query } = parsedUrl;

		if (pathName.startsWith("/api/")) {
			request["originalRequest"] = request;
			response["originalResponse"] = response;

			const context = {
				"req": request,
				"res": response,
				"pathname": pathName,
				"query": query
			};

			let componentPath;

			if (existsSync(path.join(basePath, pathName + ".ts"))) {
				componentPath = path.join(basePath, pathName + ".ts");
			} else if (requestCache[pathName] !== undefined) {
				componentPath = requestCache[pathName];
			} else {
				const subPath = pathName.substring("/api/".length).split("/") || undefined;

				for (let x = 0, file = subPath[x], directory = path.join(basePath, "api"); x < subPath.length; directory = path.join(directory, file), x++, file = subPath[x]) {
					if (!directory.startsWith(path.join(basePath, "api"))) {
						break;
					}

					if (!existsSync(path.join(directory, file))) {
						const files = await fs.readdir(directory);

						let match = files.find(function(file) {
							return /^\[(?!\[)/ui.test(file);
						});

						if (match === undefined) {
							match = files.find(function(file) {
								return /^\[\[/ui.test(file);
							});
						}

						if (match !== undefined) {
							file = match;

							const matchPath = path.join(directory, match);

							if (!(await fs.stat(matchPath)).isDirectory()) {
								componentPath = matchPath;

								break;
							}
						}
					}
				}

				if (componentPath === undefined) {
					response.statusCode = 404;
					response.end("Not found");

					return;
				}

				requestCache[pathName] ??= componentPath;
			}

			if (routeCache[componentPath] === undefined) {
				const { "default": Component, getStaticProps } = await import(componentPath);

				const { props = {}, revalidate = 60 } = await getStaticProps(context);

				routeCache[componentPath] = function() {
					return (memoize(Component, revalidate * 1000))(props);
				};
			}

			let type = "json";
			let body = await (routeCache[componentPath])();

			if (typeof body !== "string") {
				body = JSON.stringify(body, undefined, 4);
			} else {
				type = "html";
			}

			// @ts-expect-error
			app.server.pipe(function(context) {
				return {
					"type": type,
					"body": RenderResult.fromStatic(body)
				};
			}, context);

			return;
		}

		requestHandler(request, response, parsedUrl);
	};
}
