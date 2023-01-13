import { fido } from "fido";
import { spawnReadline } from "../spawnReadline";

let isRunning = false;

await spawnReadline("docker", [
	"container",
	"ls",
	"--filter name=\"image-name\""
], function(line) {
	if (line.includes("Up")) {
		isRunning = true;

		return null;
	}
});

if (!isRunning) {
	// Build

	await spawnReadline("docker", [
		"image",
		"build",
		"docker",
		"--tag \"image-name\""
	]);

	// Run

	spawnReadline("docker", [
		"container",
		"run",
		"--name container-name",
		"--rm",
		"-it", // Required
		"--privileged",
		"--publish 80:80",
		"image-name:latest"
	]);
}

await fido.poll("http://localhost", {}, {
	"maxRetries": Infinity
});

console.log("Ready!");

// Because we aren't detaching and we want the containers to keep running, we have to exit explicitly.
process.exit(0);
