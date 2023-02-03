//import { scheduleJob } from "node-schedule";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import express from "express";
import helmet from "helmet";
import logger from "morgan";

import { __root } from "./config";

export const app = express();

app.use(helmet({
	"contentSecurityPolicy": {
		"directives": {
			...helmet.contentSecurityPolicy.getDefaultDirectives(),
			"script-src": ["'self'", "https:", "'unsafe-inline'"],
			"script-src-elem": ["'self'", "https:", "'unsafe-inline'"]
		}
	}
}));

app.set("json spaces", 4);

app.set("views", path.join(__root, "views"));

app.set("view engine", "ejs");

app.use(logger("dev"));

async function bindRoutes(routesDirectory) {
	const files = [];

	(function recurse(directory) {
		for (const file of fs.readdirSync(directory)) {
			if (fs.statSync(path.join(directory, file)).isDirectory()) {
				recurse(path.join(directory, file));
			} else if (path.extname(file).toLowerCase() === ".ts") {
				files.push(path.join(directory, file));
			}
		}
	})(routesDirectory);

	for (const file of files) {
		const route = await import(url.pathToFileURL(file).toString());

		const middlewares = route["middlewares"] ?? [];

		for (const routeHandler of Object.keys(route)) {
			let [method] = /^(?:all|connect|del(?:ete)?|get|head|options|patch|post|put|trace)/u.exec(routeHandler) || [];

			if (method === undefined) {
				continue;
			}

			if (routeHandler === "del") {
				method = "delete";
			}

			const parsedPath = path.parse(file.substring(routesDirectory.length));
			let pathName = parsedPath.dir;

			if (parsedPath.name !== "index") {
				pathName = path.join(pathName, parsedPath.name);
			}

			pathName = pathName.replace(/\\/gu, "/");

			if (route[routeHandler].length === 2) {
				console.log("Binding " + method.toUpperCase() + " " + pathName);

				app[method](pathName, ...middlewares, route[routeHandler]);
			} else {
				const { path = pathName, middleware = [], callback } = route[routeHandler](pathName);

				console.log("Binding " + method.toUpperCase() + " " + path);

				app[method](path, ...middleware, callback);
			}
		}
	}

	app.get("*", function(request, response, next) {
		const basePath = path.join(__root, "public");
		const fullPath = path.join(basePath, request.path);

		if (path.resolve(fullPath).startsWith(basePath)) {
			if (fs.existsSync(fullPath)) {
				if (fs.statSync(fullPath).isFile()) {
					response.sendFile(fullPath);

					return;
				}
			}
		}

		response.status(404);

		next();
	});
}

//async function bindScheduledTasks(scheduledTasksDirectory) {
//  const files = [];
//
//  (function recurse(directory) {
//      for (const file of fs.readdirSync(directory)) {
//          if (fs.statSync(path.join(directory, file)).isDirectory()) {
//              //recurse(path.join(directory, file));
//          } else if (path.extname(file).toLowerCase() === ".ts") {
//              files.push(path.join(directory, file));
//          }
//      }
//  })(scheduledTasksDirectory);
//
//  for (const file of files) {
//      const defaultExport = (await import(url.pathToFileURL(file).toString())).default;
//
//      if (defaultExport !== undefined) {
//          console.log("Scheduling ." + file.substring(scheduledTasksDirectory.length).replace(/\\/gu, "/"));
//
//          scheduleJob(...defaultExport);
//      }
//  }
//}

await bindRoutes(path.join(__root, "routes"));

app.listen(8080, function() {
	//bindScheduledTasks(path.join(__root, "scheduledTasks"));

	console.log("Listening on http://localhost:" + this.address().port + "/");
});
