// @ts-check

import { createInterface } from "readline";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = (function parseArgs(args, defaults = {}) {
	const argv = defaults;

	args = args.join(" ").match(/(?<=^| )-(.*?)(?= +-|$)/gu) || [];

	for (let x = 0; x < args.length; x++) {
		const arg = args[x];

		if (arg[1] !== "-") {
			for (const shorthand of arg.substring(1).split("")) {
				argv[shorthand] = true;
			}

			continue;
		} else if (arg.length === 2) {
			break;
		}

		const value = arg.split(/ +|=/u);
		const key = value.shift().replace(/^-+/u, "");

		argv[key] = value.join(" ") || (args[x + 1] === undefined || args[x + 1].startsWith("-") || args[x + 1]);
	}

	return argv;
})(process.argv, {
	"exclude": ["package.json", "package-lock.json"]
});

// Aliases
for (const [shorthand, alias] of Object.entries({
	"d": "dry-run",
	"r": "recursive",
	"t": "retab",
	"u": "update",
	"x": "exclude",
	"y": "yes"
})) {
	argv[alias] = argv[shorthand] ?? argv[alias] ?? false;

	delete argv[shorthand];
}

let readline;

if (argv["yes"] !== true) {
	readline = createInterface({
		"input": process.stdin,
		"output": process.stdout
	});
}

const prevDirectory = path.join(__dirname, "..");
const baseDirectory = process.cwd();

function confirm(prompt, defaultOption = true) {
	return new Promise(function(resolve, reject) {
		readline.question(prompt + (defaultOption ? " [Y/n] " : " [y/N] "), async function(answer) {
			if (/^y(es)?$/iu.test(answer) || (answer === "" && defaultOption === true)) {
				resolve(true);
			} else if (/^n(o)?$/iu.test(answer) || (answer === "" && defaultOption === false)) {
				resolve(false);
			} else {
				resolve(await confirm(prompt, defaultOption));
			}
		});
	});
}

async function update(directory = baseDirectory) {
	if (prevDirectory === directory) {
		return;
	}

	for (const file of [[".eslintrc.json"], ["tsconfig.json"], [".vscode", "extensions.json"], [".vscode", "settings.json"]]) {
		if (fs.existsSync(path.join(directory, ...file))) {
			if (argv["yes"] === true || (await confirm("Overwrite `" + path.join(directory, ...file) + "`?")) === true) {
				fs.copyFileSync(path.join(prevDirectory, ...file), path.join(directory, ...file));
			}
		}
	}
}

function findRepositories(baseDirectory) {
	const repositories = [];

	(function recurse(directory) {
		for (const file of fs.readdirSync(directory)) {
			if (fs.statSync(path.join(directory, file)).isDirectory()) {
				if (file === ".git") {
					repositories.push(directory);
				}

				if (file !== "node_modules") {
					recurse(path.join(directory, file));
				}
			}
		}
	})(baseDirectory);

	return repositories;
}

function findRepositoryTextFiles(cwd = baseDirectory) {
	const options = {
		"cwd": cwd,
		"encoding": "utf8"
	} as any;

	if (process.platform === "win32") {
		const bash = path.join(process.env["ProgramW6432"], "Git", "usr", "bin", "bash.exe");
		const wsl = path.join(process.env["windir"], "System32", "bash.exe");

		if (fs.existsSync(bash)) {
			options["env"] = {
				"PATH": "/mingw64/bin:/usr/local/bin:/usr/bin:/bin"
			};

			options["shell"] = bash;
		} else if (fs.existsSync(wsl)) {
			const { root, dir, base } = path.parse(cwd);

			options["cwd"] = path.join("/", "mnt", root.split(":")[0].toLowerCase(), dir.substring(root.length), base).replace(/\\/gu, "/");

			options["shell"] = wsl;
		} else {
			throw new Error("No suitable shell found. Aborting.");
		}
	}

	const files = execSync("git ls-files", options).split("\n");
	const textFiles = [];

	for (const file of files) {
		if (/text/gu.test(execSync("file \"" + cwd + "/" + file + "\"", options))) {
			textFiles.push(file);
		}
	}

	return textFiles;
}

function retab(file) {
	fs.readFile(file, "utf8", function(error, data: any) {
		// Convert leading, trim trailing
		data = data.replace(/^\t+/gmu, function(match) {
			return " ".repeat(match.length * 4);
		}).replace(/[ \t]+$/gmu, "");

		const indentationWidth = (/^ {2,}/mu.exec(data) || [""])[0].length;

		data = data.split("\n");

		let indentationLevel = 0;

		let errors = "";

		for (let x = 0; x < data.length; x++) {
			const [indentation, firstToken] = (/^\s{2,}?\S+/u.exec(data[x]) || [""])[0].split(/(\S+)/u, 2);
			const lastToken = data[x].split(/(\S+)$/u, 2).pop();

			if (data[x] !== "" || indentationLevel === indentation.length / indentationWidth) {
				if (indentation.length === ((indentationLevel + 1) * indentationWidth)) {
					indentationLevel += 1;
				} else if (indentation.length === ((indentationLevel - 1) * indentationWidth)) {
					indentationLevel -= 1;
				} else if (indentation.length === ((indentationLevel - 2) * indentationWidth)) {
					// Big jump, but not unreasonable
					indentationLevel = indentation.length / indentationWidth;
				} else if (indentation.length !== ((indentationLevel) * indentationWidth)
					&& indentation.length % indentationWidth === 0) {
					if (errors === "") {
						errors += file + "\n";
					}

					errors += "    at " + file + ":" + (x + 1) + " - Unexpected indentation jump\n";

					indentationLevel = indentation.length / indentationWidth;
				}
			}
		}

		if (errors !== "") {
			console.error(errors);
		}

		// Ensure newline at EOF
		if (data[data.length - 1] !== "") {
			data.push("");
		}

		data = data.join("\n");

		if (indentationWidth >= 2 && !file.toLowerCase().endsWith(".md")) {
			data = data.replace(new RegExp("^( {" + indentationWidth + "})+", "gmu"), function(match) {
				return "\t".repeat(match.length / indentationWidth);
			});
		}

		if (argv["dry-run"] !== true) {
			fs.writeFile(file, data, function(error) { });
		}
	});
}

function addKeyValuePairToJsonFile(key, value, file) {
	const parsedFile = JSON.parse(fs.readFileSync(file, { "encoding": "utf8" }));

	const lastKey = key.pop();

	const parentKey = key.reduce(function(object, key) {
		return object[key];
	}, parsedFile);

	parentKey[lastKey] = value;

	fs.writeFileSync(file, JSON.stringify(parsedFile, undefined, 2));
}

if (argv["recursive"] === true && argv["update"] === true) {
	const repositories = findRepositories(baseDirectory);

	for (const repository of repositories) {
		await update(repository);
	}

	if (argv["retab"] === true) {
		for (const repository of repositories) {
			const files = findRepositoryTextFiles(repository).filter(function(file) {
				return !argv["exclude"].includes(path.basename(file));
			});

			for (const file of files) {
				retab(path.join(repository, file));
			}
		}
	}
} else if (argv["update"] === true) {
	if (!fs.existsSync(path.join(baseDirectory, "package.json"))) {
		if (await confirm("Are you sure you're in the right place?", false)) {
			update();
		}
	}
} else {
	if (!fs.existsSync(path.join(baseDirectory, "package.json"))) {
		execSync("npm init" + (argv["yes"] === true ? " --yes" : ""), { "cwd": baseDirectory, "stdio": "inherit" });
		console.log();

		fs.writeFileSync(path.join(baseDirectory, "package.json"), fs.readFileSync(path.join(baseDirectory, "package.json"), { "encoding": "utf-8" }).replace("\"main\": \"index.js\"", "\"type\": \"module\""));
	}

	const dependencies = ["@types/node", "juvy", "next", "react-dom", "react", "ts-node", "typescript"];
	const devDependencies = ["@types/react", "@typescript-eslint/eslint-plugin", "@typescript-eslint/parser", "eslint@7.32.0"];

	fs.copyFileSync(path.join(prevDirectory, ".eslintrc.json"), path.join(baseDirectory, ".eslintrc.json"));

	fs.mkdirSync(path.join(baseDirectory, ".vscode"), { "recursive": true });

	fs.copyFileSync(path.join(prevDirectory, ".vscode", "extensions.json"), path.join(baseDirectory, ".vscode", "extensions.json"));
	fs.copyFileSync(path.join(prevDirectory, ".vscode", "launch.json"), path.join(baseDirectory, ".vscode", "launch.json"));
	fs.copyFileSync(path.join(prevDirectory, ".vscode", "settings.json"), path.join(baseDirectory, ".vscode", "settings.json"));

	fs.mkdirSync(path.join(baseDirectory, "config"), { "recursive": true });

	fs.copyFileSync(path.join(prevDirectory, "config", "index.ts"), path.join(baseDirectory, "config", "index.ts"));

	fs.mkdirSync(path.join(baseDirectory, "config", "dev"), { "recursive": true });
	fs.mkdirSync(path.join(baseDirectory, "config", "prod"), { "recursive": true });

	fs.copyFileSync(path.join(prevDirectory, "config", "dev", "example.ts"), path.join(baseDirectory, "config", "dev", "example.ts"));
	fs.copyFileSync(path.join(prevDirectory, "config", "prod", "example.ts"), path.join(baseDirectory, "config", "prod", "example.ts"));

	fs.copyFileSync(path.join(prevDirectory, "tsconfig.json"), path.join(baseDirectory, "tsconfig.json"));

	fs.mkdirSync(path.join(baseDirectory, "pages"), { "recursive": true });

	fs.copyFileSync(path.join(prevDirectory, "pages", "index.tsx"), path.join(baseDirectory, "pages", "index.tsx"));
	fs.copyFileSync(path.join(prevDirectory, "pages", "_app.tsx"), path.join(baseDirectory, "pages", "_app.tsx"));
	fs.copyFileSync(path.join(prevDirectory, "pages", "_document.tsx"), path.join(baseDirectory, "pages", "_document.tsx"));

	fs.mkdirSync(path.join(baseDirectory, "routes"), { "recursive": true });

	fs.mkdirSync(path.join(baseDirectory, "styles"), { "recursive": true });

	fs.copyFileSync(path.join(prevDirectory, "styles", "globals.css"), path.join(baseDirectory, "styles", "globals.css"));
	fs.copyFileSync(path.join(prevDirectory, "styles", "Home.module.css"), path.join(baseDirectory, "styles", "Home.module.css"));

	fs.copyFileSync(path.join(prevDirectory, "server.ts"), path.join(baseDirectory, "server.ts"));

	fs.copyFileSync(path.join(prevDirectory, "tsconfig.json"), path.join(baseDirectory, "tsconfig.json"));

	if (argv["yes"] === true || await confirm("GitHub Actions?")) {
		fs.mkdirSync(path.join(baseDirectory, ".github", "workflows"), { "recursive": true });

		fs.copyFileSync(path.join(prevDirectory, ".github", "workflows", "ci.yml"), path.join(baseDirectory, ".github", "workflows", "ci.yml"));
	}

	if (argv["yes"] === true || await confirm("Express?")) {
		fs.mkdirSync(path.join(baseDirectory, "util"), { "recursive": true });

		fs.copyFileSync(path.join(prevDirectory, "util", "renderer.ts"), path.join(baseDirectory, "util", "renderer.ts"));
		fs.copyFileSync(path.join(prevDirectory, "util", "router.ts"), path.join(baseDirectory, "util", "router.ts"));

		fs.mkdirSync(path.join(baseDirectory, "views", "partials"), { "recursive": true });

		fs.copyFileSync(path.join(prevDirectory, "views", "index.ejs"), path.join(baseDirectory, "views", "index.ejs"));
		fs.copyFileSync(path.join(prevDirectory, "views", "partials", "_header.ejs"), path.join(baseDirectory, "views", "partials", "_header.ejs"));
		fs.copyFileSync(path.join(prevDirectory, "views", "partials", "_footer.ejs"), path.join(baseDirectory, "views", "partials", "_footer.ejs"));
	}

	if (argv["yes"] === true || await confirm("Cypress?")) {
		devDependencies.push("cypress");

		fs.copyFileSync(path.join(prevDirectory, "cypress.json"), path.join(baseDirectory, "cypress.json"));

		fs.mkdirSync(path.join(baseDirectory, "cypress", "integration"), { "recursive": true });

		fs.copyFileSync(path.join(prevDirectory, "cypress", "integration", "sanity.test.ts"), path.join(baseDirectory, "cypress", "integration", "sanity.test.ts"));

		fs.mkdirSync(path.join(baseDirectory, "cypress", "plugins"), { "recursive": true });

		fs.copyFileSync(path.join(prevDirectory, "cypress", "plugins", "index.ts"), path.join(baseDirectory, "cypress", "plugins", "index.ts"));
		fs.copyFileSync(path.join(prevDirectory, "cypress", "plugins", "log.ts"), path.join(baseDirectory, "cypress", "plugins", "log.ts"));

		addKeyValuePairToJsonFile(["scripts", "cypress"], "cypress run", path.join(baseDirectory, "package.json"));
	}

	addKeyValuePairToJsonFile(["scripts", "lint"], "eslint --ignore-pattern \"public/**/*\" --quiet \"**/*.ts\"", path.join(baseDirectory, "package.json"));
	addKeyValuePairToJsonFile(["scripts", "start"], "node --experimental-specifier-resolution=node --loader=ts-node/esm server.ts", path.join(baseDirectory, "package.json"));

	if (argv["yes"] === true || await confirm("Ava?")) {
		devDependencies.push("ava");

		fs.copyFileSync(path.join(prevDirectory, "ava.config.js"), path.join(baseDirectory, "ava.config.js"));

		fs.mkdirSync(path.join(baseDirectory, "test"), { "recursive": true });

		fs.copyFileSync(path.join(prevDirectory, "test", "sanity.test.ts"), path.join(baseDirectory, "test", "sanity.test.ts"));

		addKeyValuePairToJsonFile(["scripts", "test"], "ava", path.join(baseDirectory, "package.json"));
	}

	if (readline !== undefined) {
		readline.close();
	}

	console.log("> npm install " + dependencies.join(" ") + "\n");
	execSync("npm install " + dependencies.join(" "), { "cwd": baseDirectory, "stdio": "inherit" });

	console.log("> npm install --save-dev " + devDependencies.join(" ") + "\n");
	execSync("npm install --save-dev " + devDependencies.join(" "), { "cwd": baseDirectory, "stdio": "inherit" });
}
