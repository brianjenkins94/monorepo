import Head from "next/head";
import Script from "next/script";
import type { AppProps } from "next/app";

import DefaultLayout from "../layouts/default";

export default function App({ Component, pageProps }: AppProps) {
	const Layout = Component["getLayout"] ?? DefaultLayout;

	return (
		<>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>

			<Layout>
				<Component {...pageProps} />
			</Layout>

			{process.env["NODE_ENV"] !== "production" && <Script src="/_next/static/chunks/sw.js" strategy="beforeInteractive" />}
		</>
	);
}
