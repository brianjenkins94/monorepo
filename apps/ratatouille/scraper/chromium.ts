import { chromium } from "playwright-chromium";

let browser;

let context;

async function scrape(options = {}) {
	options["devtools"] = options["devtools"] ?? !options["headless"];
	options["headless"] = options["headless"] ?? true;

	browser = browser ?? await chromium.launch({
		"devtools": options["devtools"],
		"headless": options["headless"]
		//"downloadsPath": path.join(__root, "downloads")
	});

	context = context ?? await browser.newContext();

	const page = await context.newPage();

	await page.goto(options["url"]);

	await (async function scrape({ page, context, options }) {
		console.log(page, context, options);
	})({
		"context": context,
		"options": options,
		"page": page
	});

	// Return the context in case the callee wants to close it.
	return context;
}

await scrape({
	"url": "https://www.allrecipes.com/",
	"headless": !(Boolean(process.env["CI"]) || process.platform === "win32" || Boolean(process.env["DISPLAY"]))
});

await browser.close();
