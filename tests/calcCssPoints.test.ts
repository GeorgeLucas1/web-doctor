import { expect, test, describe } from "bun:test";
import calcCssPoints from "../src/css/calcCssPoints";
import type { AstItem } from "../src/css/types";

function createMock(
	selector: string,
	property: string,
	value: string,
	isImportant: boolean = false
): AstItem {
	return {
		selector,
		properties: [
			{ property, value, isImportant }
		]
	};
}

describe("Base Rules", () => {
	test("Should return 10 points for a perfectly formatted CSS", () => {
		const mockCss: AstItem[] = [
			createMock(".my-class", "color", "#fff"),
			createMock("*", "padding", "false"),
		];
		const result = calcCssPoints(mockCss);
		expect(result).toBe(10);
	});
});

describe("Selectors Penalties", () => {
	test("Should deduct 1 point when an ID selector is used", () => {
		const mockCss: AstItem[] = [
			createMock("#my-id", "color", "#fff")
		];
		const result = calcCssPoints(mockCss);
		expect(result).toBe(9);
	});

	test("Should deduct 1 point when universal selector contains heavy properties", () => {
		const mockCss = [
			createMock("*", "color", "#fff")
		];
		const result = calcCssPoints(mockCss);
		expect(result).toBe(9);
	});

	test("Should deduct 1 point when a selector has 5 or more levels of depth", () => {
		const mockCss = [
			createMock("html body main div p", "color", "#fff")
		];
		const result = calcCssPoints(mockCss);
		expect(result).toBe(9);
	});

	test("Should deduct 1 point when a selector has no properties", () => {
		const mockCss: AstItem[] = [
			{
				selector: "body",
				properties: []
			}
		];
		const result = calcCssPoints(mockCss);
		expect(result).toBe(9);
	});
});

describe("Properties Penalties", () => {
	test("Should deduct 1 point when !important flag is used", () => {
		const mockCss = [
			createMock("h1", "color", "#fff", true)
		];
		const result = calcCssPoints(mockCss);
		expect(result).toBe(9);
	});

	test("Should deduct 1 point when outline is set to none or 0", () => {
		const mockCss = [
			createMock("button", "outline", "none")
		];
		const result = calcCssPoints(mockCss);
		expect(result).toBe(9);
	});

	test("Should deduct 1 point when color property uses a literal name", () => {
		const mockCss = [
			createMock("h1", "color", "red")
		];
		const result = calcCssPoints(mockCss);
		expect(result).toBe(9);
	});

	test("Should deduct 1 point when font-size uses px instead of relative units", () => {
		const mockCss = [
			createMock("p", "font-size", "16px")
		];
		const result = calcCssPoints(mockCss);
		expect(result).toBe(9);
	});
});

describe("Edge Cases", () => {
	test("Should not return a negative score, flooring at 0", () => {
		const mockCss: AstItem[] = [
			createMock("body", "color", "red", true),
			createMock("h1", "font-size", "16px", true),
			createMock("h1", "color", "blue", true),
			createMock("button", "outline", "none", true),
			createMock("*", "font-family", "Arial", true),
			{
				selector: "p",
				properties: []
			},
			{
				selector: "h2",
				properties: []
			},
			{
				selector: "h3",
				properties: []
			},
			{
				selector: "h4",
				properties: []
			},
		];
		const result = calcCssPoints(mockCss);
		expect(result).toBe(0);
	});
});
