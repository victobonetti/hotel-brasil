import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { getStaffAccessSummary } from "./auth-access";
import { AuthShowcaseSignedInView } from "./auth-showcase-view";

describe("auth showcase signed-in view", () => {
	test("renders staff navigation links for catalog admins", () => {
		const access = getStaffAccessSummary({
			hotelName: "Hotel Brasil Demo",
			role: "admin",
		});

		const html = renderToStaticMarkup(
			createElement(AuthShowcaseSignedInView, {
				access,
				userName: "Victor",
			}),
		);

		expect(html).toContain("Bem-vindo");
		expect(html).toContain("Victor");
		expect(html).toContain("Ver painel adm");
		expect(html).toContain('href="/staff/orders"');
		expect(html).not.toContain('href="/staff/menu"');
		expect(html).not.toContain('href="/staff/menu/items"');
	});

	test("renders only the welcome state when the account is not linked to a hotel", () => {
		const access = getStaffAccessSummary(null);

		const html = renderToStaticMarkup(
			createElement(AuthShowcaseSignedInView, {
				access,
				userName: "Victor",
			}),
		);

		expect(html).toContain("Bem-vindo");
		expect(html).toContain("Victor");
		expect(html).not.toContain('href="/staff/orders"');
		expect(html).not.toContain("Ver painel adm");
	});
});
