import { describe, expect, test } from "bun:test";

import {
	getGuestCartContent,
	getGuestMenuHeroContent,
	getGuestMobileCartCtaLabel,
} from "./guest-menu-display";

describe("getGuestMenuHeroContent", () => {
	test("returns a concise discovery message when the cart is empty", () => {
		expect(getGuestMenuHeroContent(0)).toEqual({
			description: "Escolha os itens e monte seu pedido em poucos toques.",
			eyebrow: "Menu",
			title: "Peça para o seu quarto",
		});
	});

	test("returns a checkout-oriented message when items were added", () => {
		expect(getGuestMenuHeroContent(3)).toEqual({
			description:
				"Abra o carrinho para revisar, ajustar observacoes e finalizar.",
			eyebrow: "Carrinho pronto",
			title: "Seus itens ja podem seguir",
		});
	});
});

describe("getGuestCartContent", () => {
	test("returns a direct empty state", () => {
		expect(getGuestCartContent(0)).toEqual({
			description:
				"Adicione itens do menu para revisar aqui antes de finalizar.",
			title: "Seu carrinho esta vazio",
		});
	});

	test("returns a checkout-focused state when the cart has items", () => {
		expect(getGuestCartContent(2)).toEqual({
			description:
				"Confira os itens, adicione observacoes e finalize o pedido.",
			title: "Revise antes de enviar",
		});
	});
});

describe("getGuestMobileCartCtaLabel", () => {
	test("prompts menu browsing when the cart is empty", () => {
		expect(getGuestMobileCartCtaLabel(0)).toBe("Abrir carrinho");
	});

	test("prompts checkout when the cart has items", () => {
		expect(getGuestMobileCartCtaLabel(4)).toBe("Ver carrinho");
	});
});
