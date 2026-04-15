import { randomBytes } from "node:crypto";

export function generateGuestSessionToken() {
	return randomBytes(24).toString("base64url");
}
