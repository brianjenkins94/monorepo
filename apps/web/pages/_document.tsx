import * as React from "react";
import { Head, Html, Main, NextScript } from "next/document";

class CustomHead extends Head {
	public override render() {
		const node = super.render();

		// WORKAROUND: The `<base>` tag needs to come first.
		const children = React.Children.toArray(node.props.children);

		const baseElementIndex = children.findIndex(function(element) {
			return element["type"] === "base";
		});

		const linkElementIndex = children.findIndex(function(element) {
			return element["type"] === "link";
		});

		if (baseElementIndex > linkElementIndex) {
			children.unshift(children.splice(baseElementIndex, 1)[0]);
		}

		return (
			<head>
				{children}
			</head>
		);
	}
}

export default function Document() {
	return (
		<Html lang="en">
			<CustomHead>
				<meta name="description" content="" />
				<link href="css/fontawesome-5.15.4.min.css" rel="stylesheet" />
			</CustomHead>
			{/* Disable FOUC protection */}
			<body style={{ "display": "block" }}>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
