/// <reference types="cypress" />

/* eslint-disable @typescript-eslint/no-loop-func */

import * as path from "path";

describe(__filename.substring(path.join(__dirname, "..").length), function() {
	for (const url of ["/"]) {
		it("loads", function() {
			cy.visit(url);
		});
	}
});
