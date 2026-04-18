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
				"Seu pedido ja esta quase pronto. Revise quantidades, ajuste observacoes e envie para o quarto quando estiver tudo certo.",
			eyebrow: "Bandeja em montagem",
			title: "Seu pedido esta pronto para seguir",
		};
	}

	return {
		description:
			"Descubra o menu do hotel com calma, monte seu pedido em poucos toques e acompanhe tudo sem sair da pagina.",
		eyebrow: "Seu room service",
		title: "Escolha com calma, confirme quando quiser",
	};
}
