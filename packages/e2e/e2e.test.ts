import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { format } from "node:util";

import Atlas, { type Credentials, type Logger } from "@textbook/atlas-ip";
import "dotenv/config";
import { MongoClient, MongoClientOptions } from "mongodb";

const connectionString = process.env.MONGO_URL!;
const clientOptions: MongoClientOptions = {
	serverSelectionTimeoutMS: 5_000,
};
const credentials: Credentials = {
	publicKey: process.env.ATLAS_PUBLIC_KEY!,
	privateKey: process.env.ATLAS_PRIVATE_KEY!,
};
const logger: Logger = {
	debug: pretty("debug"),
	error: pretty("error"),
	info: pretty("info"),
	warn: pretty("warn"),
};

describe("@textbook/atlas-ip", () => {
	let clients: MongoClient[];

	beforeEach(() => {
		clients = [];
	});

	afterEach(async () => {
		for (const client of clients) {
			await client.close(true);
		}
	});

	it("can permit and revoke IP access", { timeout: 60_000 }, async () => {
		let client: MongoClient;
		const atlas = Atlas.create(credentials, logger);
		const groupId = process.env.ATLAS_GROUP_ID!;
		const ipAddress = await getIp();

		client = new MongoClient(connectionString, clientOptions);
		clients.push(client);
		await assert.rejects(client.connect(), "should initially fail to connect");

		await atlas.permit(groupId, ipAddress, `E2E testing @ ${new Date().toISOString()}`);
		await waitFor(15_000);
		client = new MongoClient(connectionString, clientOptions);
		clients.push(client);
		await client.connect();

		await atlas.revoke(groupId, ipAddress);
		await waitFor(20_000);
		client = new MongoClient(connectionString, clientOptions);
		clients.push(client);
		await assert.rejects(client.connect(), "should subsequently fail to connect");
	});
});

function pretty(level: string) {
	return (...args: any[]): void => console.log("%s : %s", level.padStart(5, " "), format(...args));
}

async function getIp(): Promise<string> {
	const res = await fetch("https://checkip.amazonaws.com");
	const body = await res.text();
	return body.trim();
}

async function waitFor(ms: number): Promise<void> {
	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
