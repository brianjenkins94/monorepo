import * as ReactDOMServer from "react-dom/server";
import { SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";

function renderToString(nodes) {
	const elements = [];

	for (const node of nodes) {
		if (typeof node.type !== "string") {
			if (node.type.name === "Head") {
				elements.push(...(Array.isArray(node.props.children) ? node.props.children : [node.props.children]));

				continue;
			} else if (node.type.name === "Script") {
				elements.push(<script {...node.props}></script>);

				continue;
			}
		}

		elements.push(node);
	}

	// @ts-expect-error
	return ReactDOMServer.renderToString(elements);
}

export default function IFrame({ children }) {
	return (
		<SandpackProvider
			files={{
				"/src/index.ts": {
					"code": `
						document.addEventListener("DOMContentLoaded", function(event) {
							console.log(viewerControl);
						});
					`
				},
				"/src/styles.css": {
					"code": `
						html, body, #app, #viewerContainer {
							height: 100%;
							width: 100%;
							background-color: red;
						}
					`
				},
				"/index.html": {
					"code": `
						<!DOCTYPE html>
						<html>
						<head>
							<title>Parcel Sandbox</title>
							<meta charset="UTF-8" />
							<link href="src/styles.css" rel="stylesheet" />
						</head>
						<body>
							<div id="app">
								${renderToString(children)}
							</div>
							<script src="src/index.ts"></script>
						</body>
						</html>
			  		`
				}
			}}
			template="vanilla-ts"
		>
			<SandpackPreview
				showNavigator={false}
				showOpenInCodeSandbox={false}
				showRefreshButton={false}
			/>
		</SandpackProvider>
	);
}
