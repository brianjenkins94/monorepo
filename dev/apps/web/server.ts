import { createServer } from "http";
import { routeify } from "./util/next/router";
import * as path from "path";
import * as url from "url";
import next from "next";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getRequestHandler } from "./util/next/requestHandler";
import { trace } from "./util/trace";

const BASE_URL = "http://localhost:5000";

process.on("uncaughtException", function(error) {
	console.error(error.stack);

	//await postMessageToSlackChannel("```" + error.stack + "```", "#general");

	process.exit(1);
});

for (const signal of ["SIGINT", "SIGUSR1", "SIGUSR2"]) {
	process.on(signal, function() {
		process.exit(0);
	});
}

const app = next({
	"dev": true,
	"hostname": "localhost",
	"port": 5000
});

const requestHandler = getRequestHandler(app);

const preStartSpan = trace("prestart");

await app.prepare();

// @ts-expect-error
app.server.router.fsRoutes.push(...await routeify(path.join(__dirname, "routes")));

preStartSpan.stop();

createServer(requestHandler).listen(new URL(BASE_URL).port, function() {
	console.log("> Ready on " + BASE_URL);
});
