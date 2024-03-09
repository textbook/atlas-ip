import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { format } from "node:util";

import Atlas from "@textbook/atlas-ip";
import "dotenv/config";
import { MongoClient } from "mongodb";

const connectionString = process.env.MONGO_URL;

/** @type {import("mongodb").MongoClientOptions} */
const clientOptions = {
	serverSelectionTimeoutMS: 5_000,
};

/** @type {import("@textbook/atlas-ip").Credentials} */
const credentials = {
	publicKey: process.env.ATLAS_PUBLIC_KEY,
	privateKey: process.env.ATLAS_PRIVATE_KEY,
};

/** @type {import("@textbook/atlas-ip").Logger} */
const logger = {
	debug: pretty("debug"),
	error: pretty("error"),
	info: pretty("info"),
	warn: pretty("warn"),
};

describe("@textbook/atlas-ip", () => {
	/** @type {MongoClient[]} */
	let clients;

	beforeEach(() => {
		clients = [];
	});

	afterEach(async () => {
		for (const client of clients) {
			await client.close(true);
		}
	});

	it("can permit and revoke IP access", { timeout: 60_000 }, async () => {
		/** @type {MongoClient} */
		let client;
		const atlas = Atlas.create(credentials, logger);
		const groupId = process.env.ATLAS_GROUP_ID;
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

/**
 * @param {string} level
 * @returns {(...args: unknown[]) => void}
 */
function pretty(level) {
	return (...args) => {
		console.log("%s : %s", level.padStart(5, " "), format(...args));
	};
}

/**
 * @returns {Promise<string>} - the current IP
 */
async function getIp() {
	const res = await fetch("https://checkip.amazonaws.com");
	const body = await res.text();
	return body.trim();
}

/**
 * Create a promise that resolves after a timeout
 * @param {number} ms - number of milliseconds to wait
 * @returns {Promise<void>}
 */
async function waitFor(ms) {
	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
