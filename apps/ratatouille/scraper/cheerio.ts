import * as cheerio from "cheerio";
import { fido } from "fido";

const url = "https://www.allrecipes.com/";

const $ = cheerio.load((await fido.get(url)).body);

const text = $("#watch-description-extras > ul > li.watch-meta-item.has-image > ul > li:first-child").text();

console.log(text);
