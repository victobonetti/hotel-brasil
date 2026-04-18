import { randomUUID } from "node:crypto";

export const MAX_MENU_IMAGE_UPLOAD_BYTES = 200_000;

const SUPPORTED_MENU_IMAGE_CONTENT_TYPES = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
} as const;

export interface CatalogMembership {
	hotelId: string;
	role: string;
	userId: string;
}

export function assertCatalogManager(
	membership: CatalogMembership | null,
): CatalogMembership {
	if (!membership) {
		throw new Error("Staff membership is required.");
	}

	if (membership.role !== "admin" && membership.role !== "manager") {
		throw new Error("Only admin or manager can manage menu images.");
	}

	return membership;
}

export function resolveMenuImageExtension(contentType: string) {
	const extension =
		SUPPORTED_MENU_IMAGE_CONTENT_TYPES[
			contentType as keyof typeof SUPPORTED_MENU_IMAGE_CONTENT_TYPES
		];

	if (!extension) {
		throw new Error("Unsupported image type.");
	}

	return extension;
}

export function buildMenuImageStorageKey(input: {
	hotelId: string;
	objectId?: string;
	prefix: string;
	extension: string;
}) {
	const normalizedPrefix = input.prefix.trim().replace(/^\/+|\/+$/g, "");
	return [
		normalizedPrefix,
		input.hotelId,
		`${input.objectId ?? randomUUID()}.${input.extension}`,
	]
		.filter((segment) => segment.length > 0)
		.join("/");
}

export async function toMenuImageUploadBuffer(file: File) {
	if (!file.type.startsWith("image/")) {
		throw new Error("Selecione um arquivo de imagem valido.");
	}

	const extension = resolveMenuImageExtension(file.type);
	const arrayBuffer = await file.arrayBuffer();
	const body = Buffer.from(arrayBuffer);

	if (body.byteLength === 0) {
		throw new Error("Nao foi possivel ler a imagem selecionada.");
	}

	if (body.byteLength > MAX_MENU_IMAGE_UPLOAD_BYTES) {
		throw new Error("A imagem ficou grande demais. Escolha outra imagem.");
	}

	return {
		body,
		contentType: file.type,
		extension,
	};
}
