import { describe, expect, test } from "bun:test";

import { getGuestMenuHeroContent } from "./guest-menu-display";

describe("getGuestMenuHeroContent", () => {
	test("returns an inviting discovery message when the cart is empty", () => {
		expect(getGuestMenuHeroContent(0)).toEqual({
			description:
				"Veja o cardapio com calma, adicione o que quiser e confirme tudo em poucos toques.",
			eyebrow: "Cardapio no quarto",
			title: "Escolha seu pedido sem complicacao",
		});
	});

	test("returns a checkout-oriented message when items were added", () => {
		expect(getGuestMenuHeroContent(3)).toEqual({
			description:
				"Seu pedido ja esta quase pronto. Revise os itens, ajuste observacoes e envie quando quiser.",
			eyebrow: "Pedido em montagem",
			title: "Falta pouco para enviar ao seu quarto",
		});
	});
});
