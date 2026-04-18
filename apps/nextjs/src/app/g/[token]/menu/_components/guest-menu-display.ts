interface GuestMenuHeroContent {
	description: string;
	eyebrow: string;
	title: string;
}

export function getGuestMenuHeroContent(
	totalItems: number,
): GuestMenuHeroContent {
	if (totalItems > 0) {
		return {
			description:
				"Seu pedido ja esta quase pronto. Revise os itens, ajuste observacoes e envie quando quiser.",
			eyebrow: "Pedido em montagem",
			title: "Falta pouco para enviar ao seu quarto",
		};
	}

	return {
		description:
			"Veja o cardapio com calma, adicione o que quiser e confirme tudo em poucos toques.",
		eyebrow: "Cardapio no quarto",
		title: "Escolha seu pedido sem complicacao",
	};
}
