import Head from "next/head";
import React from "react"; // Required
import type { NextApiRequest, NextApiResponse } from "next";

import MailApp from "../components/MailApp";

export function get(request: NextApiRequest, response: NextApiResponse): Promise<void> | void {
	// @ts-expect-error
	response.render(
		<>
			<Head>
				<title>Example</title>
			</Head>

			<MailApp />
		</>
	);
}
