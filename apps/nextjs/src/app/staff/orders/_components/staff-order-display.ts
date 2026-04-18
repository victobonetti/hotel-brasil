type StaffOrderStatus =
	| "accepted"
	| "cancelled"
	| "delivered"
	| "out_for_delivery"
	| "pending"
	| "preparing";

const statusLabelMap: Record<StaffOrderStatus, string> = {
	accepted: "Aceito",
	cancelled: "Cancelado",
	delivered: "Entregue",
	out_for_delivery: "Saiu para entrega",
	pending: "Recebido",
	preparing: "Em preparo",
};

function formatTime(date: Date) {
	return new Intl.DateTimeFormat("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "America/Sao_Paulo",
	}).format(date);
}

export function getStaffOrderStatusLabel(status: StaffOrderStatus) {
	return statusLabelMap[status];
}

export function getStaffOrderDisplayMeta(input: {
	orderId: string;
	placedAt: Date;
	roomId: string;
	roomLabel?: string | null;
	status: StaffOrderStatus;
}) {
	const roomName =
		input.roomLabel?.trim().length && input.roomLabel
			? input.roomLabel.trim()
			: input.roomId;

	return {
		orderReference: `Quarto ${roomName}`,
		orderTitle: `Pedido do Quarto ${roomName}`,
		statusLabel: getStaffOrderStatusLabel(input.status),
		timingLabel: `Recebido as ${formatTime(input.placedAt)}`,
	};
}

export function buildStaffOrderHistoryLabel(input: {
	changedAt: Date;
	fromStatus: StaffOrderStatus | null;
	toStatus: StaffOrderStatus;
}) {
	if (!input.fromStatus) {
		return `Pedido recebido as ${formatTime(input.changedAt)}`;
	}

	return `Mudou de ${getStaffOrderStatusLabel(input.fromStatus)} para ${getStaffOrderStatusLabel(input.toStatus)} as ${formatTime(input.changedAt)}`;
}
