import { describe, expect, test } from "bun:test";

import {
	formatPriceInput,
	formatPriceLabel,
	parsePriceInputToCents,
} from "./price-field";

describe("price-field helpers", () => {
	test("parses friendly decimal input into cents", () => {
		expect(parsePriceInputToCents("19,90")).toBe(1990);
		expect(parsePriceInputToCents("1.234,56")).toBe(123456);
		expect(parsePriceInputToCents("abc")).toBe(0);
	});

	test("formats digits into a pt-BR style editable value", () => {
		expect(formatPriceInput("0")).toBe("0,00");
		expect(formatPriceInput("1990")).toBe("19,90");
		expect(formatPriceInput("123456")).toBe("1.234,56");
	});

	test("formats stored cents into a readable currency label", () => {
		expect(formatPriceLabel(1990).replace(/\s/g, " ")).toBe("R$ 19,90");
	});
});
