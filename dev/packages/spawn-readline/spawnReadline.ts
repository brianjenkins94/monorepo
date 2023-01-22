import { createInterface } from "readline";
import { EventEmitter } from "events";
import { spawn } from "child_process";
import * as path from "path";

class SpawnPromise extends EventEmitter {
	public command;

	public constructor(command, args, options = {}) {
		super();

		this.command = [command, ...args].join(" ");

		console.log("> " + this.command + "\n");

		const process = spawn(command, args, options);

		process.on("close", (code) => {
			this.emit("close", code);
		});

		process.on("error", (error) => {
			this.emit("error", error);
		});

		const readline = createInterface({
			"input": process.stdout
		});

		readline.on("line", (line) => {
			if (line.trim() !== "") {
				this.emit("line", line);
			}
		});
	}
}

const bash = process.platform === "win32" ? path.join(process.env["ProgramW6432"], "Git", "usr", "bin", "bash.exe") : true;

export function spawnReadline(command, args, lineHandler?) {
	return new Promise<void>(function(resolve, reject) {
		const process = new SpawnPromise(command, args, {
			// Spawn won't allocate a TTY if detached
			//"detached": true,
			"encoding": "utf8",
			"shell": bash,
			"stdio": ["inherit", "pipe", "pipe"]
		});

		if (lineHandler !== undefined) {
			// Inspired by:
			// https://docs.cypress.io/api/commands/task.html#Event
			process.on("line", function(line) {
				if (lineHandler(line) === null) {
					resolve();
				}
			});
		}

		process.on("close", function(code) {
			if (code !== 0) {
				reject(new Error("`" + process.command + "` exited with non-zero exit status " + code));
			}

			resolve();
		});

		process.on("error", function(error) {
			reject(error);
		});
	});
}
