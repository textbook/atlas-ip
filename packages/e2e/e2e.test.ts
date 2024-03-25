import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { format } from "node:util";

import "dotenv/config";
import Atlas, { type Credentials, type Logger } from "@textbook/atlas-ip";
import { MongoClient, type MongoClientOptions } from "mongodb";

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
		logger.debug("closing %d clients", clients.length);
		await Promise.all(clients.map((client) => client.close(true)));
	});

	it("can permit and revoke IP access", { timeout: 120_000 }, async () => {
		const atlas = Atlas.create(credentials, logger);
		const groupId = process.env.ATLAS_GROUP_ID!;
		const ipAddress = await getIp();

		await waitForResolution(() => {
			return assert.rejects(createClient().connect(), "should initially fail to connect");
		});

		await atlas.permit(groupId, ipAddress, `E2E testing @ ${new Date().toISOString()}`);
		await waitForResolution(() => {
			return createClient().connect();
		});

		await atlas.revoke(groupId, ipAddress);
		await waitForResolution(() => {
			return assert.rejects(createClient().connect(), "should subsequently fail to connect");
		});
	});

	function createClient(): MongoClient {
		const client = new MongoClient(connectionString, clientOptions);
		clients.push(client);
		return client;
	}
});

function pretty(level: string): (...args: unknown[]) => void {
	return (...args) => {
		console.log("%s : %s", level.padStart(5, " "), format(...args));
	};
}

async function getIp(): Promise<string> {
	const res = await fetch("https://checkip.amazonaws.com");
	const body = await res.text();
	return body.trim();
}

/**
 * Create a promise that resolves after a timeout
 */
async function waitFor(ms: number): Promise<void> {
	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/**
 * Repeat until the factory returns a promise that resolves.
 */
async function waitForResolution(factory: () => Promise<unknown>): Promise<void> {
	let delay = 500;
	const loop = () => factory().catch(async () => {
		logger.debug("waiting %dms", delay);
		await waitFor(delay);
		delay *= 2;
		await loop();
	});
	await loop();
}
