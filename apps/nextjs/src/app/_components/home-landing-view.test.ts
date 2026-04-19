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

		expect(html).toContain('aria-label="NoWait24 inicio"');
		expect(html).toContain("Plataforma de room service");
		expect(html).toContain("Entrada da equipe");
		expect(html).toContain("Navegacao principal");
		expect(html).toContain("NoWait24 para hoteis que querem vender melhor");
		expect(html).toContain(
			"O room service que aumenta a receita sem aumentar o caos da operacao.",
		);
		expect(html).toContain("Painel do hotel");
		expect(html).toContain("Conhecer a plataforma");
		expect(html).toContain("Acessar painel");
		expect(html).toContain("Como funciona na pratica");
		expect(html).toContain(
			"Pronto para profissionalizar o room service do hotel?",
		);
	});
});
