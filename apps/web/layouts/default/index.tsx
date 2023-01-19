import Head from "next/head";

import { Footer } from "./_Footer";
import { Header } from "./_Header";

export default function Layout({ children }) {
	return (
		<>
			<Head>
				<title>Web</title>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
				<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@300&display=swap" rel="stylesheet" />
				<link href="css/style.css" rel="stylesheet" />
			</Head>

			<Header />
			{children}
			<Footer />
		</>
	);
}
