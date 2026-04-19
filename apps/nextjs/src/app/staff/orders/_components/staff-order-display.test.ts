import { describe, expect, test } from "bun:test";

import {
	buildStaffOrderHistoryLabel,
	getStaffOrderDisplayMeta,
	getStaffOrderStatusLabel,
} from "./staff-order-display";

describe("getStaffOrderStatusLabel", () => {
	test("translates operational statuses to Portuguese", () => {
		expect(getStaffOrderStatusLabel("pending")).toBe("Pendente");
		expect(getStaffOrderStatusLabel("accepted")).toBe("Aceito");
		expect(getStaffOrderStatusLabel("preparing")).toBe("Em preparo");
		expect(getStaffOrderStatusLabel("out_for_delivery")).toBe(
			"Saiu para entrega",
		);
		expect(getStaffOrderStatusLabel("delivered")).toBe("Entregue");
		expect(getStaffOrderStatusLabel("cancelled")).toBe("Cancelado");
	});
});

describe("getStaffOrderDisplayMeta", () => {
	test("avoids exposing the raw order id in the admin headline", () => {
		expect(
			getStaffOrderDisplayMeta({
				orderId: "3410b709-3e6a-403a-8c18-294c29cd2aaf",
				placedAt: new Date("2026-04-18T13:25:00.000Z"),
				roomId: "room-101",
				roomLabel: "101",
				status: "preparing",
			}),
		).toMatchObject({
			orderReference: "Quarto 101",
			orderTitle: "Pedido do Quarto 101",
			statusLabel: "Em preparo",
			timingLabel: "Recebido as 10:25",
		});
	});
});

describe("buildStaffOrderHistoryLabel", () => {
	test("renders a readable history sentence in Portuguese", () => {
		expect(
			buildStaffOrderHistoryLabel({
				changedAt: new Date("2026-04-18T14:30:00.000Z"),
				fromStatus: "accepted",
				toStatus: "preparing",
			}),
		).toBe("Mudou de Aceito para Em preparo as 11:30");
	});

	test("renders the initial state without English labels", () => {
		expect(
			buildStaffOrderHistoryLabel({
				changedAt: new Date("2026-04-18T12:10:00.000Z"),
				fromStatus: null,
				toStatus: "pending",
			}),
		).toBe("Pedido recebido as 09:10");
	});
});
