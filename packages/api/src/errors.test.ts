import { describe, expect, test } from "bun:test";

import { mapDomainErrorToUserMessage } from "./errors";

describe("mapDomainErrorToUserMessage", () => {
	test("maps expired sessions to a friendly guest message", () => {
		expect(
			mapDomainErrorToUserMessage({ code: "GUEST_SESSION_EXPIRED" }, "guest"),
		).toMatchObject({
			code: "GUEST_SESSION_EXPIRED",
			title: "Sessão expirada",
		});
	});

	test("maps unavailable items to a specific guest message", () => {
		expect(
			mapDomainErrorToUserMessage({ code: "MENU_ITEM_UNAVAILABLE" }, "guest"),
		).toMatchObject({
			code: "MENU_ITEM_UNAVAILABLE",
			title: "Item indisponível",
		});
	});

	test("maps forbidden staff access to a clear message", () => {
		expect(
			mapDomainErrorToUserMessage({ code: "TENANT_MISMATCH" }, "staff"),
		).toMatchObject({
			code: "TENANT_MISMATCH",
			title: "Acesso negado",
		});
	});

	test("falls back safely for unknown errors", () => {
		expect(
			mapDomainErrorToUserMessage(new Error("boom"), "guest"),
		).toMatchObject({
			code: "INTERNAL_ERROR",
			title: "Erro inesperado",
		});
	});

	test("maps outdated database schema errors to a staff-friendly message", () => {
		expect(
			mapDomainErrorToUserMessage(
				{ code: "DATABASE_SCHEMA_OUTDATED" },
				"staff",
			),
		).toMatchObject({
			code: "DATABASE_SCHEMA_OUTDATED",
			title: "Banco desatualizado",
		});
	});
});
