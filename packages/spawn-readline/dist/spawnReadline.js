// spawnReadline.ts
import { createInterface } from "readline";
import { EventEmitter } from "events";
import { spawn } from "child_process";
import * as path from "path";
var SpawnPromise = class extends EventEmitter {
  constructor(command, args, options = {}) {
    super();
    this.command = [command, ...args].join(" ");
    console.log("> " + this.command + "\n");
    const process2 = spawn(command, args, options);
    process2.on("close", (code) => {
      this.emit("close", code);
    });
    process2.on("error", (error) => {
      this.emit("error", error);
    });
    const readline = createInterface({
      "input": process2.stdout
    });
    readline.on("line", (line) => {
      if (line.trim() !== "") {
        this.emit("line", line);
      }
    });
  }
};
var bash = process.platform === "win32" ? path.join(process.env["ProgramW6432"], "Git", "usr", "bin", "bash.exe") : true;
function spawnReadline(command, args, lineHandler) {
  return new Promise(function(resolve, reject) {
    const process2 = new SpawnPromise(command, args, {
      // Spawn won't allocate a TTY if detached
      //"detached": true,
      "encoding": "utf8",
      "shell": bash,
      "stdio": ["inherit", "pipe", "pipe"]
    });
    if (lineHandler !== void 0) {
      process2.on("line", function(line) {
        if (lineHandler(line) === null) {
          resolve();
        }
      });
    }
    process2.on("close", function(code) {
      if (code !== 0) {
        reject(new Error("`" + process2.command + "` exited with non-zero exit status " + code));
      }
      resolve();
    });
    process2.on("error", function(error) {
      reject(error);
    });
  });
}
export {
  spawnReadline
};
