type OrderStatus =
	| "accepted"
	| "cancelled"
	| "delivered"
	| "out_for_delivery"
	| "pending"
	| "preparing";

type StepState = "active" | "complete" | "upcoming";

interface TrackingStep {
	label: string;
	state: StepState;
}

interface TrackingStatusPresentation {
	accentClassName: string;
	description: string;
	eyebrow: string;
	progressValue: number;
	title: string;
}

const defaultSteps = [
	{ label: "Recebido", status: "pending" },
	{ label: "Aceito", status: "accepted" },
	{ label: "Em preparo", status: "preparing" },
	{ label: "A caminho", status: "out_for_delivery" },
	{ label: "Entregue", status: "delivered" },
] as const;

const statusPresentationMap: Record<OrderStatus, TrackingStatusPresentation> = {
	accepted: {
		accentClassName: "from-[#ea1d2c] via-[#ff5a36] to-[#ff8f3d]",
		description:
			"Seu pedido foi aceito pela equipe e entrou na fila prioritaria da cozinha.",
		eyebrow: "Aceito",
		progressValue: 30,
		title: "Pedido confirmado pela cozinha",
	},
	cancelled: {
		accentClassName: "from-slate-700 via-slate-600 to-slate-500",
		description:
			"Este pedido foi encerrado e nao seguira para preparo. Se precisar, voce pode montar um novo pedido.",
		eyebrow: "Cancelado",
		progressValue: 100,
		title: "Pedido cancelado",
	},
	delivered: {
		accentClassName: "from-emerald-600 via-emerald-500 to-lime-400",
		description:
			"Seu pedido chegou ao quarto. Se quiser repetir a experiencia, o cardapio continua disponivel.",
		eyebrow: "Entregue",
		progressValue: 100,
		title: "Pedido entregue no seu quarto",
	},
	out_for_delivery: {
		accentClassName: "from-[#ea1d2c] via-[#ff6a00] to-[#ffb347]",
		description:
			"Seu pedido saiu da cozinha e esta a caminho do quarto agora mesmo.",
		eyebrow: "A caminho",
		progressValue: 82,
		title: "Falta bem pouco para chegar",
	},
	pending: {
		accentClassName: "from-[#ea1d2c] via-[#f97316] to-[#fbbf24]",
		description:
			"Recebemos o pedido e ja estamos organizando a proxima etapa para comecar o atendimento.",
		eyebrow: "Recebido",
		progressValue: 14,
		title: "Pedido recebido com sucesso",
	},
	preparing: {
		accentClassName: "from-[#ea1d2c] via-[#ff5a36] to-[#ff8f3d]",
		description:
			"A cozinha ja confirmou o seu pedido e esta finalizando tudo para seguir ao quarto.",
		eyebrow: "Em preparo",
		progressValue: 55,
		title: "Seu pedido esta ganhando forma",
	},
};

export function getTrackingStatusPresentation(
	status: OrderStatus,
): TrackingStatusPresentation {
	return statusPresentationMap[status];
}

export function buildTrackingSteps(status: OrderStatus): Array<TrackingStep> {
	if (status === "cancelled") {
		return [
			{ label: "Recebido", state: "complete" },
			{ label: "Cancelado", state: "active" },
		];
	}

	const activeIndex = defaultSteps.findIndex((step) => step.status === status);

	return defaultSteps.slice(0, activeIndex + 1).map(
		(step, index): TrackingStep => ({
			label: step.label,
			state: index === activeIndex ? "active" : "complete",
		}),
	);
}
