interface GuestMenuHeroContent {
	description: string;
	eyebrow: string;
	title: string;
}

interface GuestCartContent {
	description: string;
	title: string;
}

export function getGuestMenuHeroContent(
	totalItems: number,
): GuestMenuHeroContent {
	if (totalItems > 0) {
		return {
			description:
				"Abra o carrinho para revisar os itens, ajustar observacoes e finalizar.",
			eyebrow: "Carrinho pronto",
			title: "Seu pedido esta quase pronto",
		};
	}

	return {
		description:
			"Escolha os itens do menu e adicione ao carrinho com poucos toques.",
		eyebrow: "Menu do quarto",
		title: "Monte seu pedido",
	};
}

export function getGuestCartContent(totalItems: number): GuestCartContent {
	if (totalItems > 0) {
		return {
			description:
				"Confira os itens, adicione observacoes gerais e envie para o hotel.",
			title: "Revisar e finalizar",
		};
	}

	return {
		description:
			"Os itens do menu aparecem aqui para voce revisar antes de finalizar.",
		title: "Carrinho vazio",
	};
}

export function getGuestMobileCartCtaLabel(totalItems: number) {
	return totalItems > 0 ? "Abrir checkout" : "Ver carrinho";
}
