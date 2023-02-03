import Head from "next/head";
import React from "react"; // Required
import type { NextApiRequest, NextApiResponse } from "next";

export function get(request: NextApiRequest, response: NextApiResponse): Promise<void> | void {
	// @ts-expect-error
	response.render(
		<>
			<Head>
				<title>Example</title>
			</Head>
		</>
	);
}
