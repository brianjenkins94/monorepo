#!/usr/bin/env node

// @ts-check

import { createInterface } from "readline";
import * as path from "path";
import * as url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readline = createInterface({
	"input": process.stdin,
	"output": process.stdout
});

const __root = path.join(__dirname, "..");
const baseDirectory = process.cwd();
