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

		expect(html).toContain("Room service para hoteis que querem operar melhor");
		expect(html).toContain("O pedido sai do quarto com contexto");
		expect(html).toContain("Painel do hotel");
		expect(html).toContain("Ver a operacao");
		expect(html).toContain("Como a operacao flui");
		expect(html).toContain("O que muda no dia a dia");
	});
});
