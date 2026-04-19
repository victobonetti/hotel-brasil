import { describe, expect, test } from "bun:test";

import {
	getGuestCartContent,
	getGuestMenuHeroContent,
	getGuestMobileCartCtaLabel,
} from "./guest-menu-display";

describe("getGuestMenuHeroContent", () => {
	test("returns a concise discovery message when the cart is empty", () => {
		expect(getGuestMenuHeroContent(0)).toEqual({
			description:
				"Escolha os itens do menu e adicione ao carrinho com poucos toques.",
			eyebrow: "Menu do quarto",
			title: "Monte seu pedido",
		});
	});

	test("returns a checkout-oriented message when items were added", () => {
		expect(getGuestMenuHeroContent(3)).toEqual({
			description:
				"Abra o carrinho para revisar os itens, ajustar observacoes e finalizar.",
			eyebrow: "Carrinho pronto",
			title: "Seu pedido esta quase pronto",
		});
	});
});

describe("getGuestCartContent", () => {
	test("returns a direct empty state", () => {
		expect(getGuestCartContent(0)).toEqual({
			description:
				"Os itens do menu aparecem aqui para voce revisar antes de finalizar.",
			title: "Carrinho vazio",
		});
	});

	test("returns a checkout-focused state when the cart has items", () => {
		expect(getGuestCartContent(2)).toEqual({
			description:
				"Confira os itens, adicione observacoes gerais e envie para o hotel.",
			title: "Revisar e finalizar",
		});
	});
});

describe("getGuestMobileCartCtaLabel", () => {
	test("prompts menu browsing when the cart is empty", () => {
		expect(getGuestMobileCartCtaLabel(0)).toBe("Ver carrinho");
	});

	test("prompts checkout when the cart has items", () => {
		expect(getGuestMobileCartCtaLabel(4)).toBe("Abrir checkout");
	});
});
