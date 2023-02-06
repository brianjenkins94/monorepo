// eslint-disable-next-line @typescript-eslint/no-import-type-side-effects
import "../styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
