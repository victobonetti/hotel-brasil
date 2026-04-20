"use client";

export const ITEM_IMAGE_SIZE = 200;
export const MAX_ITEM_IMAGE_DATA_URL_LENGTH = 200_000;

function encodeStorageKeySegment(segment: string) {
	return encodeURIComponent(segment);
}

export function buildMenuImageProxyUrl(storageKey: string) {
	return `/api/storage/menu-images/object/${storageKey
		.split("/")
		.map((segment) => encodeStorageKeySegment(segment))
		.join("/")}`;
}

export function resolveMenuItemImageSrc(input: {
	imageStorageKey?: string | null;
	imageUrl?: string | null;
}) {
	if (input.imageStorageKey) {
		return buildMenuImageProxyUrl(input.imageStorageKey);
	}

	return input.imageUrl ?? null;
}

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

export function processedImageDataUrlToFile(
	dataUrl: string,
	fileName = "menu-item-image.webp",
) {
	const validatedDataUrl = validateProcessedImageDataUrl(dataUrl);
	const [metadata, encodedPayload] = validatedDataUrl.split(",", 2);

	if (!metadata || !encodedPayload) {
		throw new Error("Arquivo de imagem invalido.");
	}

	const mimeType = metadata.match(/^data:(.+);base64$/)?.[1];
	if (!mimeType) {
		throw new Error("Arquivo de imagem invalido.");
	}

	const binary = atob(encodedPayload);
	const bytes = new Uint8Array(binary.length);

	for (const [index, character] of Array.from(binary).entries()) {
		bytes[index] = character.charCodeAt(0);
	}

	return new File([bytes], fileName, { type: mimeType });
}

export async function uploadProcessedMenuItemImage(file: File) {
	const formData = new FormData();
	formData.append("file", file);

	const response = await fetch("/api/storage/menu-images", {
		body: formData,
		method: "POST",
	});

	interface UploadMenuItemImageResponse {
		error?: string;
		key?: string;
		url?: string;
	}

	let payload: UploadMenuItemImageResponse | null = null;
	try {
		payload = (await response.json()) as UploadMenuItemImageResponse;
	} catch {
		payload = null;
	}

	if (!response.ok || !payload?.key || !payload.url) {
		throw new Error(
			payload?.error ?? "Nao foi possivel enviar a imagem agora.",
		);
	}

	return {
		key: payload.key,
		url: payload.url,
	};
}

function readFileAsDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			const { result } = reader;
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
