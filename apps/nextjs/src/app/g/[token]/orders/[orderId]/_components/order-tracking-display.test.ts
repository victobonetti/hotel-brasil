import { describe, expect, test } from "bun:test";

import {
	buildTrackingSteps,
	getTrackingStatusPresentation,
} from "./order-tracking-display";

describe("getTrackingStatusPresentation", () => {
	test("returns a delivery-focused hero for orders in preparation", () => {
		expect(getTrackingStatusPresentation("preparing")).toMatchObject({
			accentClassName: "from-[#ea1d2c] via-[#ff5a36] to-[#ff8f3d]",
			description:
				"A cozinha ja confirmou o seu pedido e esta finalizando tudo para seguir ao quarto.",
			eyebrow: "Em preparo",
			progressValue: 55,
			title: "Seu pedido esta ganhando forma",
		});
	});

	test("returns a calmer completion state after delivery", () => {
		expect(getTrackingStatusPresentation("delivered")).toMatchObject({
			eyebrow: "Entregue",
			progressValue: 100,
			title: "Pedido entregue no seu quarto",
		});
	});
});

describe("buildTrackingSteps", () => {
	test("marks previous steps as complete and the current one as active", () => {
		expect(buildTrackingSteps("out_for_delivery")).toEqual([
			expect.objectContaining({
				label: "Recebido",
				state: "complete",
			}),
			expect.objectContaining({
				label: "Aceito",
				state: "complete",
			}),
			expect.objectContaining({
				label: "Em preparo",
				state: "complete",
			}),
			expect.objectContaining({
				label: "A caminho",
				state: "active",
			}),
		]);
	});

	test("treats cancelled orders as a dedicated final state", () => {
		expect(buildTrackingSteps("cancelled")).toEqual([
			expect.objectContaining({
				label: "Recebido",
				state: "complete",
			}),
			expect.objectContaining({
				label: "Cancelado",
				state: "active",
			}),
		]);
	});
});
