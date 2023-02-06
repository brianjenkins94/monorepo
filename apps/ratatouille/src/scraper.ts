import { chromium } from "playwright-chromium";
import * as cheerio from "cheerio";

let browser;

let context;

export async function scrape(url) {
	browser = browser ?? await chromium.launch({
		//"devtools": true,
		"headless": !(Boolean(process.env["CI"]) || process.platform === "win32" || Boolean(process.env["DISPLAY"]))
		//"downloadsPath": path.join(__root, "downloads")
	});

	context = context ?? await browser.newContext();

	const page = await context.newPage();

	await page.goto(url);

	if (url.startsWith("https://www.allrecipes.com/search")) {
		const results = await Promise.all((await page.$$("a[href^=\"https://www.allrecipes.com/recipe/\"]")).map(function(element) {
			return element.getAttribute("href");
		}));

		page.close();

		return results;
	} else if (url.startsWith("https://www.allrecipes.com/recipe/")) {
		const $ = cheerio.load(await (await page.$("#allrecipes-article_1-0")).innerHTML());

		page.close();

		const name = $("#article-heading_2-0").text().trim();
		const ingredients = $("#mntl-structured-ingredients_1-0 .mntl-structured-ingredients__list-item").toArray().map(function(element) {
			return $(element).text().trim();
		});
		const steps = $("#recipe__steps-content_1-0 li[id^=\"mntl-sc-block_2-0-\"]").toArray().map(function(element) {
			// Account for the possibility of multiple paragraphs per step.
			return $(element).find("p[id^=\"mntl-sc-block_2-0-\"]").toArray().map(function(element) {
				return $(element).text().trim();
			}).join("\n\n");
		});

		return {
			"name": name,
			"ingredients": ingredients,
			"steps": steps
		};
	} else {
		throw new Error("This should never happen.");
	}
}

export async function search(query) {
	const url = new URL("https://www.allrecipes.com/search");
	url.searchParams.append("q", query);

	return scrape(url.toString());
}

const results = await scrape((await search("grilled cheese"))[0]);

console.log(results);

await browser.close();
