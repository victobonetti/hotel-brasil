import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { OrderQueueBoard } from "./order-queue-board";

describe("OrderQueueBoard", () => {
	test("renders dense order queue cards with room, time, total, and status", () => {
		const html = renderToStaticMarkup(
			createElement(OrderQueueBoard, {
				emptyMessage: "Sem pedidos",
				onSelect: () => {},
				orders: [
					{
						id: "order-1",
						placedAt: new Date("2026-04-19T12:00:00.000Z"),
						room: {
							label: "204",
						},
						roomId: "room-204",
						status: "pending",
						totalAmountInCents: 6500,
					},
				],
				selectedOrderId: null,
				title: "Fila ativa",
			}),
		);

		expect(html).toContain("Fila ativa");
		expect(html).toContain("Quarto 204");
		expect(html).toContain("Pendente");
		expect(html).toContain("Horario");
		expect(html).toContain("Total");
		expect(html).toContain("R$");
	});
});
