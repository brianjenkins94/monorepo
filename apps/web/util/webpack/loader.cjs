const { bundleMDX } = require("mdx-bundler");
const { getMDXComponent } = require("mdx-bundler/client");
const { remarkCodeHike } = require("@code-hike/mdx");
const theme = require("shiki/themes/nord");
const path = require("path");

const { buildPageMap } = require("../pageMap/build.cjs");

const basePath = path.join(__dirname, "..", "..");

const pageDirectory = path.join(basePath, "pages");

function rfc3986EncodeURIComponent(uriComponent) {
	return encodeURIComponent(uriComponent).replace(/[!'()*]/g, function(character) {
		return "%" + character.charCodeAt(0).toString(16);
	});
}

let pageMap;

module.exports = async function(source) {
	const callback = this.async();

	const options = this.getOptions();

	this.addContextDependency(pageDirectory);

	pageMap = pageMap ?? await buildPageMap(pageDirectory);

	let { code, frontmatter } = await bundleMDX({
		"source": source,
		"mdxOptions": function(options, frontmatter) {
			// TODO: Get Code Hike to work
			options.remarkPlugins = [...(options.remarkPlugins ?? []), [remarkCodeHike, { "theme": theme }]];
		},
		"esbuildOptions": function(options, frontmatter) {
			options.minify = false;

			return options;
		}
	});

	code = code.split("\n");

	let _createMdxContent = code.slice(code.indexOf("  function _createMdxContent(props) {"));
	_createMdxContent = _createMdxContent.slice(0, _createMdxContent.indexOf("  }") + 1).join("\n");

	const Component = getMDXComponent(code.join("\n"));

	callback(null, `
		import * as import_jsx_runtime from "react/jsx-runtime";

		import Layout from "${this.utils.contextify(this.context, path.join(basePath, options.theme, "index.tsx"))}";

		${_createMdxContent}

		export default ${Component.toString()}

		${Component.name}.getLayout = function(page) {
			return <Layout pageMap="${rfc3986EncodeURIComponent(JSON.stringify(pageMap))}">{${Component.name}(page)}</Layout>;
		};
	`);
};
