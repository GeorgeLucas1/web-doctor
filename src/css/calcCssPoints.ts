import type { AstItem } from "./types";

function calcCssPoints(cssAst: AstItem[]): number {
	let points = 10;

	for (let item of cssAst) {
		const selectorHasNoProperties = item.properties.length < 1;
		if (selectorHasNoProperties) points -= 1;

		const hasIdSelector = item.selector.includes("#");
		if (hasIdSelector) points -= 1;

		const selectors = item.selector.match(/\S+/g) || [];
		if (selectors.length >= 5) points -= 1;

		if (item.selector === "*") {
			const hasHeavyProperty = item.properties.some(declaration => isNotLayoutProperty(declaration.property));
			if (hasHeavyProperty) points -= 1;
		}

		if (points <= 0) return 0;

		for (let declaration of item.properties) {
			if (declaration.isImportant) points -= 1;

			switch (declaration.property) {
				case "outline":
					if (outlineValueHasNoneOrZero(declaration.value)) points -= 1;
					break;
				case "color":
					if (colorValueHasLiteralName(declaration.value)) points -= 1;
					break;
				case "z-index":
					if (hasExcessiveZIndex(declaration.value)) points -= 1;
					break;
				case "font-size":
					if (isPixelBasedFont(declaration.value)) points -= 1;
					break;
			}

			if (points <= 0) return 0;
		}
	}

	return Math.max(0, points);
}

function colorValueHasLiteralName(value: string) {
	const isHex = value.startsWith("#");
	const isVar = value.startsWith("var");
	const isRgb = value.startsWith("rgb");
	const isHsl = value.startsWith("hsl");
	const isTransparent = value === "transparent";

	return !isHex && !isVar && !isRgb && !isHsl && !isTransparent;
}

function isNotLayoutProperty(property: string) {
	const isMargin = property === "margin";
	const isPadding = property === "padding";
	const isBoxSizing = property === "box-sizing";

	return !isMargin && !isPadding && !isBoxSizing;
}

function outlineValueHasNoneOrZero(value: string) {
	const isNone = value === "none";
	const isZero = value === "0";

	return isNone || isZero;
}

function hasExcessiveZIndex(value: string) {
	return Number(value) > 100;
}

function isPixelBasedFont(value: string) {
	return value.includes("px");
}

export default calcCssPoints;
