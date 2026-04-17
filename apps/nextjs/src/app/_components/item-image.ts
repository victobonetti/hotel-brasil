"use client";

export const ITEM_IMAGE_SIZE = 200;
export const MAX_ITEM_IMAGE_DATA_URL_LENGTH = 200_000;

export function getCenteredSquareCrop(width: number, height: number) {
	const size = Math.min(width, height);

	return {
		height: size,
		sourceX: Math.floor((width - size) / 2),
		sourceY: Math.floor((height - size) / 2),
		width: size,
	};
}

export function isSupportedImageFile(file: File) {
	return file.type.startsWith("image/");
}

export function validateProcessedImageDataUrl(dataUrl: string) {
	if (!dataUrl.startsWith("data:image/")) {
		throw new Error("Arquivo de imagem invalido.");
	}

	if (dataUrl.length > MAX_ITEM_IMAGE_DATA_URL_LENGTH) {
		throw new Error("A imagem ficou grande demais. Escolha outra imagem.");
	}

	return dataUrl;
}

function readFileAsDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			const result = reader.result;
			if (typeof result !== "string") {
				reject(new Error("Nao foi possivel ler a imagem selecionada."));
				return;
			}

			resolve(result);
		};
		reader.onerror = () =>
			reject(new Error("Nao foi possivel ler a imagem selecionada."));
		reader.readAsDataURL(file);
	});
}

function loadImage(src: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();

		image.onload = () => resolve(image);
		image.onerror = () =>
			reject(new Error("Nao foi possivel carregar a imagem selecionada."));
		image.src = src;
	});
}

export async function processMenuItemImage(file: File) {
	if (!isSupportedImageFile(file)) {
		throw new Error("Selecione um arquivo de imagem valido.");
	}

	const source = await readFileAsDataUrl(file);
	const image = await loadImage(source);
	const crop = getCenteredSquareCrop(image.naturalWidth, image.naturalHeight);
	const canvas = document.createElement("canvas");

	canvas.width = ITEM_IMAGE_SIZE;
	canvas.height = ITEM_IMAGE_SIZE;

	const context = canvas.getContext("2d");
	if (!context) {
		throw new Error("Nao foi possivel preparar a imagem.");
	}

	context.drawImage(
		image,
		crop.sourceX,
		crop.sourceY,
		crop.width,
		crop.height,
		0,
		0,
		ITEM_IMAGE_SIZE,
		ITEM_IMAGE_SIZE,
	);

	let dataUrl = canvas.toDataURL("image/webp", 0.82);
	if (!dataUrl.startsWith("data:image/webp")) {
		dataUrl = canvas.toDataURL("image/jpeg", 0.82);
	}

	return validateProcessedImageDataUrl(dataUrl);
}
