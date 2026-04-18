import { db } from "@nowait24/db/client";
import {
	getS3CompatibleStorageConfig,
	S3CompatibleStorage,
} from "@nowait24/utils/storage";
import { NextResponse } from "next/server";

import { auth } from "~/auth/server";
import { env } from "@nowait24/utils/env";
import {
	assertCatalogManager,
	buildMenuImageStorageKey,
	toMenuImageUploadBuffer,
} from "./helpers";

export const runtime = "nodejs";

export async function POST(request: Request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session?.user) {
		return NextResponse.json(
			{ error: "Autenticacao obrigatoria." },
			{ status: 401 },
		);
	}

	const membership = await db.query.staffUserHotels.findFirst({
		columns: {
			hotelId: true,
			role: true,
			userId: true,
		},
		where: (table, { eq }) => eq(table.userId, session.user.id),
	});

	let resolvedMembership;
	try {
		resolvedMembership = assertCatalogManager(membership ?? null);
	} catch (error) {
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Nao foi possivel validar o acesso.",
			},
			{ status: 403 },
		);
	}

	const storageConfig = getS3CompatibleStorageConfig({
		accessKeyId: env.STORAGE_ACCESS_KEY_ID,
		bucket: env.STORAGE_BUCKET,
		endpoint: env.STORAGE_ENDPOINT,
		forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
		publicBaseUrl: env.STORAGE_PUBLIC_BASE_URL,
		region: env.STORAGE_REGION,
		secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
	});

	if (!storageConfig) {
		return NextResponse.json(
			{ error: "Storage nao configurado." },
			{ status: 503 },
		);
	}

	const formData = await request.formData();
	const file = formData.get("file");
	if (!(file instanceof File)) {
		return NextResponse.json(
			{ error: "Selecione um arquivo de imagem valido." },
			{ status: 400 },
		);
	}

	try {
		const uploadFile = await toMenuImageUploadBuffer(file);
		const storage = new S3CompatibleStorage(storageConfig);
		const key = buildMenuImageStorageKey({
			extension: uploadFile.extension,
			hotelId: resolvedMembership.hotelId,
			prefix: env.STORAGE_MENU_ITEMS_PREFIX,
		});
		const uploaded = await storage.upload({
			body: uploadFile.body,
			contentType: uploadFile.contentType,
			key,
		});

		return NextResponse.json(uploaded);
	} catch (error) {
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Nao foi possivel enviar a imagem agora.",
			},
			{ status: 400 },
		);
	}
}
