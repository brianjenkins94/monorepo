import { defineConfig } from "cypress";

export default defineConfig({
	"e2e": {
		"baseUrl": "http://localhost:5000",
		"setupNodeEvents": function(on, config) {
			// Implement node event listeners here
		}
	},
	"video": false,
	"viewportHeight": 1080,
	"viewportWidth": 1920
});
