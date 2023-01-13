import { spawnReadline } from "./spawnReadline";

await spawnReadline("echo", [
	"\"Hello, World!\""
], function(line) {
	if (line.includes("Hello, World!")) {
		return null;
	}
});

// Because we aren't detaching, we may need to exit explicitly.
process.exit(0);
