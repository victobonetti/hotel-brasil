import { describe, expect, test } from "bun:test";

import { getGuestMenuHeroContent } from "./guest-menu-display";

describe("getGuestMenuHeroContent", () => {
	test("returns an inviting discovery message when the cart is empty", () => {
		expect(getGuestMenuHeroContent(0)).toEqual({
			description:
				"Descubra o menu do hotel com calma, monte seu pedido em poucos toques e acompanhe tudo sem sair da pagina.",
			eyebrow: "Seu room service",
			title: "Escolha com calma, confirme quando quiser",
		});
	});

	test("returns a checkout-oriented message when items were added", () => {
		expect(getGuestMenuHeroContent(3)).toEqual({
			description:
				"Seu pedido ja esta quase pronto. Revise quantidades, ajuste observacoes e envie para o quarto quando estiver tudo certo.",
			eyebrow: "Bandeja em montagem",
			title: "Seu pedido esta pronto para seguir",
		});
	});
});
