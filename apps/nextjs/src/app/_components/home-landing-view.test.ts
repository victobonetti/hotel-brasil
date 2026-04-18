import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { HomeLandingView } from "./home-landing-view";

describe("home landing view", () => {
	test("renders the product narrative and staff access area", () => {
		const html = renderToStaticMarkup(
			createElement(HomeLandingView, {
				authSlot: createElement("div", null, "Painel do hotel"),
			}),
		);

		expect(html).toContain("Room service digital para hoteis");
		expect(html).toContain("Uma landing pensada para vender a operacao");
		expect(html).toContain("Do QR no quarto ao pedido entregue");
		expect(html).toContain("Painel do hotel");
		expect(html).toContain("Como funciona");
		expect(html).toContain("Resultados que a operacao sente");
	});
});
