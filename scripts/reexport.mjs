#!/usr/bin/env node

// @ts-check

import * as path from "path";
import * as url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __root = path.join(__dirname, "..");
