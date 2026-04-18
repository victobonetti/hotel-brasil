import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";

export interface FileStorage {
	delete(key: string): Promise<void>;
	getPublicUrl(key: string): string;
	upload(params: {
		body: Buffer;
		contentType: string;
		key: string;
	}): Promise<{ key: string; url: string }>;
}

export interface S3CompatibleStorageConfig {
	accessKeyId: string;
	bucket: string;
	endpoint: string;
	forcePathStyle?: boolean;
	publicBaseUrl: string;
	region: string;
	secretAccessKey: string;
}

type S3CompatibleClient = Pick<S3Client, "send">;

function trimTrailingSlashes(value: string) {
	return value.replace(/\/+$/, "");
}

function encodeStorageKey(key: string) {
	return key
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");
}

export function normalizePublicBaseUrl(url: string) {
	return trimTrailingSlashes(url);
}

export function isManagedStorageKey(key: string, prefix: string) {
	const normalizedKey = key.trim();
	const normalizedPrefix = prefix.trim().replace(/^\/+|\/+$/g, "");

	if (normalizedPrefix.length === 0) {
		return normalizedKey.length > 0;
	}

	return (
		normalizedKey === normalizedPrefix ||
		normalizedKey.startsWith(`${normalizedPrefix}/`)
	);
}

export function resolveStorageBoolean(
	value: string | boolean | undefined,
	defaultValue: boolean,
) {
	if (typeof value === "boolean") {
		return value;
	}

	if (value === undefined) {
		return defaultValue;
	}

	return value === "true";
}

export function getS3CompatibleStorageConfig(input: {
	accessKeyId?: string;
	bucket?: string;
	endpoint?: string;
	forcePathStyle?: string | boolean;
	publicBaseUrl?: string;
	region?: string;
	secretAccessKey?: string;
}) {
	const values = [
		input.accessKeyId,
		input.bucket,
		input.endpoint,
		input.publicBaseUrl,
		input.region,
		input.secretAccessKey,
	];
	const hasAnyValue = values.some((value) => value !== undefined);

	if (!hasAnyValue) {
		return null;
	}

	if (values.some((value) => !value || value.trim().length === 0)) {
		throw new Error("Storage configuration is incomplete");
	}

	return {
		accessKeyId: input.accessKeyId as string,
		bucket: input.bucket as string,
		endpoint: input.endpoint as string,
		forcePathStyle: resolveStorageBoolean(input.forcePathStyle, true),
		publicBaseUrl: normalizePublicBaseUrl(input.publicBaseUrl as string),
		region: input.region as string,
		secretAccessKey: input.secretAccessKey as string,
	} satisfies S3CompatibleStorageConfig;
}

export class S3CompatibleStorage implements FileStorage {
	private readonly client: S3CompatibleClient;
	private readonly config: S3CompatibleStorageConfig;

	constructor(
		config: S3CompatibleStorageConfig,
		client: S3CompatibleClient = new S3Client({
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			},
			endpoint: config.endpoint,
			forcePathStyle: config.forcePathStyle ?? true,
			region: config.region,
		}),
	) {
		this.client = client;
		this.config = {
			...config,
			publicBaseUrl: normalizePublicBaseUrl(config.publicBaseUrl),
		};
	}

	async delete(key: string) {
		await this.client.send(
			new DeleteObjectCommand({
				Bucket: this.config.bucket,
				Key: key,
			}),
		);
	}

	getPublicUrl(key: string) {
		return `${this.config.publicBaseUrl}/${encodeStorageKey(key)}`;
	}

	async upload(params: {
		body: Buffer;
		contentType: string;
		key: string;
	}) {
		await this.client.send(
			new PutObjectCommand({
				Body: params.body,
				Bucket: this.config.bucket,
				ContentType: params.contentType,
				Key: params.key,
			}),
		);

		return {
			key: params.key,
			url: this.getPublicUrl(params.key),
		};
	}
}
