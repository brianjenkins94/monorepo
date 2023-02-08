// @ts-check

import * as path from "path";
import * as url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Extract to `./config`
const __root = __dirname;

const contentSecurityPolicyHeaders = {
	"Content-Security-Policy": Object.entries({
		"default-src": "'self'",
		"base-uri": "'self'",
		"font-src": "'self' https: data:",
		"form-action": "'self'",
		"frame-ancestors": "'self'",
		"frame-src": "'self' https://*.codesandbox.io/",
		"img-src": "'self' data:",
		"object-src": "'none'",
		"script-src": process.env["NODE_ENV"] === "production" ? "'self'" : "'self' https: 'unsafe-eval'",
		"script-src-attr": "'none'",
		"style-src": "'self' https: 'unsafe-inline'",
		"upgrade-insecure-requests": ""
	}).map(function([key, value]) {
		return [key, value].join(" ");
	}).join(";").trim(),
	//"Cross-Origin-Embedder-Policy": "require-corp",
	"Cross-Origin-Opener-Policy": "same-origin",
	"Cross-Origin-Resource-Policy": "same-origin",
	"Origin-Agent-Cluster": "?1",
	"Referrer-Policy": "no-referrer",
	"Strict-Transport-Security": "max-age=15552000; includeSubDomains",
	"X-Content-Type-Options": "nosniff",
	"X-DNS-Prefetch-Control": "off",
	"X-Download-Options": "noopen",
	"X-Frame-Options": "SAMEORIGIN",
	"X-Permitted-Cross-Domain-Policies": "none",
	"X-XSS-Protection": "0"
};

export default {
	"basePath": "/ratatouille",
	"env": {
		"NEXT_PUBLIC_API_MOCKING": "enabled"
	},
	"headers": async function() {
		return [
			{
				"source": "/:path*",
				"headers": Object.entries(contentSecurityPolicyHeaders).map(function([key, value]) {
					return {
						"key": key,
						"value": value
					};
				})
			}
		];
	},
	"images": {
		"unoptimized": true
	},
	"pageExtensions": ["js", "jsx", "ts", "tsx", "md", "mdx"],
	"reactStrictMode": true,
	"redirects": async function() {
		return [];
	},
	"rewrites": async function() {
		return [];
	},
	"transpilePackages": ["fido"],
	"webpack": function(config, options) {
		config.optimization.minimize = process.env["NODE_ENV"] === "production";

		/*
		config.module.rules.push({
			"test": /\.mdx?$/,
			"use": [
				options.defaultLoaders.babel,
				{
					"loader": "./util/webpack/loader.cjs", // "nextra/loader",
					"options": { "theme": "./layouts/docs" }
				}
			]
		});
		*/

		return config;
	}
};
