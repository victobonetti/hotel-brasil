import { describe, expect, test } from "bun:test";

import { getGuestMenuHeroContent } from "./guest-menu-display";

describe("getGuestMenuHeroContent", () => {
	test("returns an inviting discovery message when the cart is empty", () => {
		expect(getGuestMenuHeroContent(0)).toEqual({
			description:
				"Explore as categorias, personalize cada item e monte um pedido rapido com a mesma fluidez de um app de delivery.",
			eyebrow: "Room service digital",
			title: "Escolha o que vai bem no seu momento",
		});
	});

	test("returns a checkout-oriented message when items were added", () => {
		expect(getGuestMenuHeroContent(3)).toEqual({
			description:
				"Seu pedido ja esta em montagem. Continue escolhendo itens e finalize quando estiver tudo certo para o quarto.",
			eyebrow: "Montando seu pedido",
			title: "Seu room service esta quase pronto para envio",
		});
	});
});
