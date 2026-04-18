import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { GuestMenuActions } from "./guest-menu-actions";

describe("GuestMenuActions", () => {
	test("renders a visible shortcut to the guest orders page", () => {
		const html = renderToStaticMarkup(
			createElement(GuestMenuActions, {
				guestSessionToken: "guest-token",
			}),
		);

		expect(html).toContain('/g/guest-token/orders');
		expect(html).toContain("Meus pedidos");
	});
});
