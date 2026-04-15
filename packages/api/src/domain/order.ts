import type { OrderStatus } from "@finchat/db/schema";

export type OrderTotalLineItem = {
	quantity: number;
	unitPriceSnapshotInCents: number;
};

export type OrderCreationItem = {
	available: boolean;
	menuItemId: string;
	notes?: string;
	quantity: number;
};

export type OrderCreationPayload = {
	items: OrderCreationItem[];
	orderNotes?: string;
};

export type TransitionableOrder = {
	acceptedAt?: Date | null;
	cancelledAt?: Date | null;
	deliveredAt?: Date | null;
	deliveringAt?: Date | null;
	preparingAt?: Date | null;
	status: OrderStatus;
};

const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
	accepted: ["preparing", "cancelled"],
	cancelled: [],
	delivered: [],
	out_for_delivery: ["delivered", "cancelled"],
	pending: ["accepted", "cancelled"],
	preparing: ["out_for_delivery", "cancelled"],
};

function assertPositiveInteger(value: number, fieldName: string) {
	if (!Number.isInteger(value) || value <= 0) {
		throw new Error(`${fieldName} must be a positive integer`);
	}
}

function assertNonNegativeInteger(value: number, fieldName: string) {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`${fieldName} must be a non-negative integer`);
	}
}

export function calculateOrderTotal(items: OrderTotalLineItem[]) {
	return items.reduce((total, item) => {
		assertPositiveInteger(item.quantity, "quantity");
		assertNonNegativeInteger(
			item.unitPriceSnapshotInCents,
			"unitPriceSnapshotInCents",
		);
		return total + item.quantity * item.unitPriceSnapshotInCents;
	}, 0);
}

export function validateOrderCreation(payload: OrderCreationPayload) {
	if (payload.items.length === 0) {
		throw new Error("Order must include at least one item");
	}

	for (const item of payload.items) {
		assertPositiveInteger(item.quantity, "quantity");
		if (!item.available) {
			throw new Error(`Menu item ${item.menuItemId} is unavailable`);
		}
	}

	return payload;
}

export function canTransitionOrderStatus(
	currentStatus: OrderStatus,
	nextStatus: OrderStatus,
) {
	return orderStatusTransitions[currentStatus].includes(nextStatus);
}

export function transitionOrderStatus(
	order: TransitionableOrder,
	nextStatus: OrderStatus,
	changedAt = new Date(),
) {
	if (!canTransitionOrderStatus(order.status, nextStatus)) {
		throw new Error(
			`Cannot transition order from ${order.status} to ${nextStatus}`,
		);
	}

	const nextOrder: TransitionableOrder = {
		...order,
		status: nextStatus,
	};

	if (nextStatus === "accepted") {
		nextOrder.acceptedAt = order.acceptedAt ?? changedAt;
	}

	if (nextStatus === "preparing") {
		nextOrder.preparingAt = order.preparingAt ?? changedAt;
	}

	if (nextStatus === "out_for_delivery") {
		nextOrder.deliveringAt = order.deliveringAt ?? changedAt;
	}

	if (nextStatus === "delivered") {
		nextOrder.deliveredAt = order.deliveredAt ?? changedAt;
	}

	if (nextStatus === "cancelled") {
		nextOrder.cancelledAt = order.cancelledAt ?? changedAt;
	}

	return nextOrder;
}

export function isMenuItemAvailable(item: { available: boolean }) {
	return item.available;
}
