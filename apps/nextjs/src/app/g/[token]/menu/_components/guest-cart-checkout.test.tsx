import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { GuestCartCheckout } from "./guest-cart-checkout";

describe("GuestCartCheckout", () => {
	test("renders a stronger mobile checkout header and primary action", () => {
		const html = renderToStaticMarkup(
			createElement(GuestCartCheckout, {
				isMobileFullscreen: true,
				isSubmitting: false,
				items: [],
				noteInputId: "mobile-order-notes",
				onClose: () => {},
				onOrderNotesChange: () => {},
				onRemoveItem: () => {},
				onSubmit: () => {},
				orderNotes: "",
				resolveMenuItem: () => undefined,
				showCloseButton: true,
				totalItems: 0,
				totalValueInCents: 0,
			}),
		);

		expect(html).toContain("Carrinho / checkout");
		expect(html).toContain("Voltar ao menu");
		expect(html).toContain("Resumo do pedido");
		expect(html).toContain("Finalizar pedido");
	});
});
