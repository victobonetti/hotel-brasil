import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { GuestOrdersPageView } from "./guest-orders-page-view";

const activeOrder = {
	id: "order-active",
	placedAt: new Date("2026-04-18T10:00:00.000Z"),
	roomId: "room-101",
	roomLabel: "101",
	status: "preparing" as const,
	totalAmountInCents: 7200,
};

const historyOrder = {
	id: "order-history",
	placedAt: new Date("2026-04-18T08:00:00.000Z"),
	roomId: "room-101",
	roomLabel: "101",
	status: "delivered" as const,
	totalAmountInCents: 4200,
};

const singlePage = {
	hasNextPage: false,
	hasPreviousPage: false,
	page: 1,
	pageSize: 6,
	totalItems: 1,
	totalPages: 1,
} as const;

describe("GuestOrdersPageView", () => {
	test("renders active orders before the history section", () => {
		const html = renderToStaticMarkup(
			createElement(GuestOrdersPageView, {
				activeOrders: [activeOrder],
				activePagination: singlePage,
				activeTotal: 1,
				guestSessionToken: "guest-token",
				hasActiveOrders: true,
				hasHistoryOrders: true,
				historyOrders: [historyOrder],
				historyPagination: singlePage,
				historyTotal: 1,
			}),
		);

		expect(html).toContain("Acompanhe seus pedidos");
		expect(
			html.indexOf(
				'Em andamento</h2><p class="text-muted-foreground text-sm">Pedidos que ainda estao sendo preparados, confirmados ou a caminho.</p>',
			),
		).toBeLessThan(
			html.indexOf(
				'Historico</h2><p class="text-muted-foreground text-sm">Pedidos entregues ou cancelados durante esta sessao do hospede.</p>',
			),
		);
		expect(html).toContain("Acompanhar");
		expect(html).toContain("Ver detalhes");
	});

	test("renders helpful empty states for both sections", () => {
		const html = renderToStaticMarkup(
			createElement(GuestOrdersPageView, {
				activeOrders: [],
				activePagination: singlePage,
				activeTotal: 0,
				guestSessionToken: "guest-token",
				hasActiveOrders: false,
				hasHistoryOrders: false,
				historyOrders: [],
				historyPagination: singlePage,
				historyTotal: 0,
			}),
		);

		expect(html).toContain("Nenhum pedido em andamento.");
		expect(html).toContain("Nenhum pedido no historico desta sessao.");
		expect(html).toContain("Fazer novo pedido");
	});
});
