import { createHash, randomBytes } from "node:crypto";

import { type Logger } from "./logger.js";

export interface Client {
	fetch(...args: Parameters<typeof fetch>): ReturnType<typeof fetch>;
}

export default class DigestedClient implements Client {

	private static readonly DIGEST_PREFIX = "Digest ";

	static create(username: string, password: string, logger: Logger = console): DigestedClient {
		return new DigestedClient(username, password, logger);
	}

	constructor(private username: string, private password: string, private logger: Logger) {}

	async fetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
		const headers = (input as Request).headers ?? new Headers(init?.headers);
		const method = (input as Request).method ?? init?.method?.toUpperCase() ?? "GET";
		const url = this.getUrl(input);
		this.logger.debug("making %s request to %s", method, url);
		let res = await fetch(input, { ...init, headers });
		this.logger.debug("request completed %d (%s)", res.status, res.statusText);
		const wwwAuth = res.headers.get("WWW-Authenticate");
		if (res.status === 401 && wwwAuth !== null) {
			headers.append("Authorization", this.createDigest(wwwAuth, method, url.pathname));
			this.logger.debug("retrying with Digest Authorization");
			res = await fetch(input, { ...init, headers });
			this.logger.debug("request completed %d (%s)", res.status, res.statusText);
		}
		return res;
	}


	private createDigest(wwwAuth: string, method: string, uri: string): string {
		if (!wwwAuth.startsWith(DigestedClient.DIGEST_PREFIX)) {
			throw new Error("invalid WWW-Authenticate header");
		}
		const { algorithm, domain, nonce, qop, realm} = this.extractParts(wwwAuth);
		if (algorithm !== "MD5") {
			throw new Error(`unsupported algorithm ${algorithm}`);
		}
		if (qop !== "auth") {
			throw new Error(`unsupported quality of protection ${qop}`);
		}
		const clientNonce = randomBytes(4).toString("hex");
		const nonceCount = "00000001";
		const HA1 = this.md5(this.username, realm, this.password);
		const HA2 = this.md5(method, uri);
		return `Digest ${[
			`username="${this.username}"`,
			`realm="${realm}"`,
			`nonce="${nonce}"`,
			`uri="${uri}"`,
			`cnonce="${clientNonce}"`,
			`nc=${nonceCount}`,
			`qop=${qop}`,
			`response="${this.md5(HA1, nonce, nonceCount, clientNonce, qop, HA2)}"`,
			"algorithm=MD5",
		].join(", ")}`;
	}

	private extractParts(wwwAuth: string): { [key: string]: string } {
		return Object.fromEntries(
			wwwAuth
				.slice(DigestedClient.DIGEST_PREFIX.length)
				.split(", ")
				.map((part) => {
					const [name, value] = part.split("=");
					if (value.startsWith('"') && value.endsWith('"')) {
						return [name, value.slice(1, -1)]
					}
					return [name, value];
				}),
		);
	}

	private getUrl(input: string | URL | Request): URL {
		if (input instanceof URL) {
			return input;
		}
		return new URL(typeof input === "string" ? input : input.url);
	}

	private md5(...parts: string[]): string {
		const hash = createHash("md5");
		hash.update(parts.join(":"));
		return hash.digest("hex");
	}
}
