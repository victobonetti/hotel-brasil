import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { FileUploadTrigger } from "./file-upload-trigger";

describe("FileUploadTrigger", () => {
	test("renders a visible label tied to the hidden input", () => {
		const html = renderToStaticMarkup(
			createElement(FileUploadTrigger, {
				inputId: "item-image",
				label: "Enviar imagem",
			}),
		);

		expect(html).toContain('for="item-image"');
		expect(html).toContain("Enviar imagem");
		expect(html).not.toContain("sr-only");
	});
});
