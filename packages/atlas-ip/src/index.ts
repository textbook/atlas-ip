import DigestedClient, { type Client } from "./client.js";
import { Logger } from "./logger.js";

export interface Credentials {
	publicKey: string;
	privateKey: string;
}

export { Logger };

export default class Atlas {

	private static readonly BASE_URL = "https://cloud.mongodb.com/api/atlas/v2";

	static create({ publicKey, privateKey }: Credentials, logger: Logger = console): Atlas {
		return new Atlas(DigestedClient.create(publicKey, privateKey, logger), logger);
	}

	constructor(private client: Client, private logger: Logger) {}

	async permit(groupId: string, ipAddress: string, comment: string): Promise<void> {
		this.logger.info("permitting access from %s to %s", ipAddress, groupId, comment);
		const payload = [
			{ comment: comment.slice(0, 80), deleteAfterDate: this.inSixHours().toISOString(), ipAddress },
		];
		this.logger.debug("payload %j", payload);
		const res = await this.client.fetch(`${Atlas.BASE_URL}/groups/${groupId}/accessList`, {
			body: JSON.stringify(payload),
			headers: {
				"Accept": "application/vnd.atlas.2023-02-01+json",
				"Content-Type": "application/json",
			},
			method: "POST",
		});
		if (!res.ok) {
			const body: any = await res.json();
			const message = body?.detail ?? res.statusText;
			this.logger.error(message);
			throw new Error(message);
		}
	}

	async revoke(groupId: string, ipAddress: string): Promise<void> {
		this.logger.info("revoking access from %s to %s", ipAddress, groupId);
		const res = await this.client.fetch(`${Atlas.BASE_URL}/groups/${groupId}/accessList/${ipAddress}`, {
			headers: {
				"Accept": "application/vnd.atlas.2023-02-01+json",
			},
			method: "DELETE",
		});
		if (!res.ok) {
			const body: any = await res.json();
			const message = body?.detail ?? res.statusText;
			this.logger.error(message);
			throw new Error(message);
		}
	}

	private inSixHours() {
		const datetime = new Date();
		datetime.setHours(datetime.getHours() + 6);
		return datetime;
	}
}
