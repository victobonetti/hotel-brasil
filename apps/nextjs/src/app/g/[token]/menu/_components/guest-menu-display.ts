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
				"Seu pedido ja esta em montagem. Continue escolhendo itens e finalize quando estiver tudo certo para o quarto.",
			eyebrow: "Montando seu pedido",
			title: "Seu room service esta quase pronto para envio",
		};
	}

	return {
		description:
			"Explore as categorias, personalize cada item e monte um pedido rapido com a mesma fluidez de um app de delivery.",
		eyebrow: "Room service digital",
		title: "Escolha o que vai bem no seu momento",
	};
}
