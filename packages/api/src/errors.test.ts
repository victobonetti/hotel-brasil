import { describe, expect, test } from "bun:test";

import { mapDomainErrorToUserMessage } from "./errors";
import { OrderServiceError } from "./services/order-service";

describe("mapDomainErrorToUserMessage", () => {
	test("maps expired sessions to a friendly guest message", () => {
		expect(
			mapDomainErrorToUserMessage(
				new OrderServiceError("GUEST_SESSION_EXPIRED", "expired"),
				"guest",
			),
		).toMatchObject({
			code: "GUEST_SESSION_EXPIRED",
			title: "Sessão expirada",
		});
	});

	test("maps unavailable items to a specific guest message", () => {
		expect(
			mapDomainErrorToUserMessage(
				new OrderServiceError("MENU_ITEM_UNAVAILABLE", "unavailable"),
				"guest",
			),
		).toMatchObject({
			code: "MENU_ITEM_UNAVAILABLE",
			title: "Item indisponível",
		});
	});

	test("maps forbidden staff access to a clear message", () => {
		expect(
			mapDomainErrorToUserMessage(
				new OrderServiceError("TENANT_MISMATCH", "forbidden"),
				"staff",
			),
		).toMatchObject({
			code: "TENANT_MISMATCH",
			title: "Acesso negado",
		});
	});

	test("falls back safely for unknown errors", () => {
		expect(mapDomainErrorToUserMessage(new Error("boom"), "guest")).toMatchObject({
			code: "INTERNAL_ERROR",
			title: "Erro inesperado",
		});
	});
});
