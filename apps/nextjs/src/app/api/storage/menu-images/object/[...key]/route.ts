import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@nowait24/utils/env";
import {
	getS3CompatibleStorageConfig,
	isManagedStorageKey,
} from "@nowait24/utils/storage";
import { NextResponse } from "next/server";
import { normalizeMenuImageObjectKey } from "~/app/api/storage/menu-images/object-route";

function getStorageConfig() {
	return getS3CompatibleStorageConfig({
		accessKeyId: env.STORAGE_ACCESS_KEY_ID,
		bucket: env.STORAGE_BUCKET,
		endpoint: env.STORAGE_ENDPOINT,
		forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
		publicBaseUrl: env.STORAGE_PUBLIC_BASE_URL,
		region: env.STORAGE_REGION,
		secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
	});
}

export async function GET(
	_: Request,
	context: { params: Promise<{ key: Array<string> }> },
) {
	const storageConfig = getStorageConfig();
	if (!storageConfig) {
		return NextResponse.json(
			{ error: "Storage nao configurado." },
			{ status: 503 },
		);
	}

	let key: string;
	try {
		key = normalizeMenuImageObjectKey((await context.params).key);
	} catch {
		return NextResponse.json(
			{ error: "Invalid storage key." },
			{ status: 400 },
		);
	}

	if (!isManagedStorageKey(key, env.STORAGE_MENU_ITEMS_PREFIX)) {
		return NextResponse.json(
			{ error: "Invalid storage key." },
			{ status: 400 },
		);
	}

	const client = new S3Client({
		credentials: {
			accessKeyId: storageConfig.accessKeyId,
			secretAccessKey: storageConfig.secretAccessKey,
		},
		endpoint: storageConfig.endpoint,
		forcePathStyle: storageConfig.forcePathStyle,
		region: storageConfig.region,
	});

	try {
		const object = await client.send(
			new GetObjectCommand({
				Bucket: storageConfig.bucket,
				Key: key,
			}),
		);

		if (!object.Body) {
			return new NextResponse(null, { status: 404 });
		}

		const bytes = await object.Body.transformToByteArray();

		return new NextResponse(bytes, {
			headers: {
				"Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
				"Content-Length": String(bytes.byteLength),
				"Content-Type": object.ContentType ?? "application/octet-stream",
			},
			status: 200,
		});
	} catch {
		return new NextResponse(null, { status: 404 });
	}
}
