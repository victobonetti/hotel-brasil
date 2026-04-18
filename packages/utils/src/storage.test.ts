import { describe, expect, test } from "bun:test";
import {
	DeleteObjectCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3";

import {
	getS3CompatibleStorageConfig,
	isManagedStorageKey,
	resolveStorageBoolean,
	S3CompatibleStorage,
} from "./storage";

describe("resolveStorageBoolean", () => {
	test("uses the default when the value is missing", () => {
		expect(resolveStorageBoolean(undefined, true)).toBe(true);
		expect(resolveStorageBoolean(undefined, false)).toBe(false);
	});

	test("parses string booleans", () => {
		expect(resolveStorageBoolean("true", false)).toBe(true);
		expect(resolveStorageBoolean("false", true)).toBe(false);
	});
});

describe("getS3CompatibleStorageConfig", () => {
	test("returns null when storage is not configured", () => {
		expect(getS3CompatibleStorageConfig({})).toBeNull();
	});

	test("throws when only part of the storage config is provided", () => {
		expect(() =>
			getS3CompatibleStorageConfig({
				bucket: "menu-images",
				endpoint: "https://storage.example.com",
			}),
		).toThrow("Storage configuration is incomplete");
	});

	test("normalizes the public base url and defaults forcePathStyle", () => {
		expect(
			getS3CompatibleStorageConfig({
				accessKeyId: "access",
				bucket: "menu-images",
				endpoint: "https://storage.example.com",
				publicBaseUrl: "https://cdn.example.com/",
				region: "sa-saopaulo-1",
				secretAccessKey: "secret",
			}),
		).toEqual({
			accessKeyId: "access",
			bucket: "menu-images",
			endpoint: "https://storage.example.com",
			forcePathStyle: true,
			publicBaseUrl: "https://cdn.example.com",
			region: "sa-saopaulo-1",
			secretAccessKey: "secret",
		});
	});
});

describe("isManagedStorageKey", () => {
	test("matches the configured prefix only", () => {
		expect(isManagedStorageKey("menu-items/hotel-1/item.webp", "menu-items")).toBe(
			true,
		);
		expect(isManagedStorageKey("avatars/user-1.webp", "menu-items")).toBe(false);
	});
});

describe("S3CompatibleStorage", () => {
	test("uploads and builds a public url", async () => {
		const commands: Array<unknown> = [];
		const storage = new S3CompatibleStorage(
			{
				accessKeyId: "access",
				bucket: "menu-images",
				endpoint: "https://storage.example.com",
				forcePathStyle: true,
				publicBaseUrl: "https://cdn.example.com/",
				region: "sa-saopaulo-1",
				secretAccessKey: "secret",
			},
			{
				send: async (command) => {
					commands.push(command);
					return {};
				},
			},
		);

		const result = await storage.upload({
			body: Buffer.from("image"),
			contentType: "image/webp",
			key: "menu-items/hotel 1/item.webp",
		});

		expect(result).toEqual({
			key: "menu-items/hotel 1/item.webp",
			url: "https://cdn.example.com/menu-items/hotel%201/item.webp",
		});
		expect(commands[0]).toBeInstanceOf(PutObjectCommand);
		expect((commands[0] as PutObjectCommand).input).toMatchObject({
			Bucket: "menu-images",
			ContentType: "image/webp",
			Key: "menu-items/hotel 1/item.webp",
		});
	});

	test("deletes objects from the configured bucket", async () => {
		const commands: Array<unknown> = [];
		const storage = new S3CompatibleStorage(
			{
				accessKeyId: "access",
				bucket: "menu-images",
				endpoint: "https://storage.example.com",
				forcePathStyle: true,
				publicBaseUrl: "https://cdn.example.com",
				region: "sa-saopaulo-1",
				secretAccessKey: "secret",
			},
			{
				send: async (command) => {
					commands.push(command);
					return {};
				},
			},
		);

		await storage.delete("menu-items/hotel-1/item.webp");

		expect(commands[0]).toBeInstanceOf(DeleteObjectCommand);
		expect((commands[0] as DeleteObjectCommand).input).toMatchObject({
			Bucket: "menu-images",
			Key: "menu-items/hotel-1/item.webp",
		});
	});
});
