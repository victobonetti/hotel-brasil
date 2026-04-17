interface OrderDisplayInput {
	orderId: string;
	roomId: string;
	roomLabel?: string | null;
}

function shortenReference(value: string) {
	const normalizedValue = value.trim();
	if (normalizedValue.length <= 8) {
		return normalizedValue.toUpperCase();
	}

	return normalizedValue.slice(0, 8).toUpperCase();
}

export function formatOrderReference(orderId: string) {
	return `#${shortenReference(orderId)}`;
}

export function formatRoomReference(input: {
	roomId: string;
	roomLabel?: string | null;
}) {
	const friendlyRoomLabel = input.roomLabel?.trim().length
		? input.roomLabel.trim()
		: shortenReference(input.roomId);

	return `Quarto ${friendlyRoomLabel}`;
}

export function getOrderDisplayMeta(input: OrderDisplayInput) {
	const orderReference = formatOrderReference(input.orderId);

	return {
		orderReference,
		orderTitle: `Pedido ${orderReference}`,
		roomReference: formatRoomReference(input),
	};
}
