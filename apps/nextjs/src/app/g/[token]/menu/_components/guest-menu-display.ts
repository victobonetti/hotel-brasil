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
				"Abra o carrinho para revisar, ajustar observacoes e finalizar.",
			eyebrow: "Carrinho pronto",
			title: "Seus itens ja podem seguir",
		};
	}

	return {
		description: "Escolha os itens e monte seu pedido em poucos toques.",
		eyebrow: "Menu",
		title: "Peça para o seu quarto",
	};
}

export function getGuestCartContent(totalItems: number): GuestCartContent {
	if (totalItems > 0) {
		return {
			description:
				"Confira os itens, adicione observacoes e finalize o pedido.",
			title: "Revise antes de enviar",
		};
	}

	return {
		description: "Adicione itens do menu para revisar aqui antes de finalizar.",
		title: "Seu carrinho esta vazio",
	};
}

export function getGuestMobileCartCtaLabel(totalItems: number) {
	return totalItems > 0 ? "Ver carrinho" : "Abrir carrinho";
}
