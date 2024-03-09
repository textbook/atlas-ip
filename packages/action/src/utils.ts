import { format } from "node:util";

import { debug, error, getInput, info, isDebug, warning } from "@actions/core";
import { type Credentials, type Logger } from "@textbook/atlas-ip";

export function getCredentials(): Credentials {
	return {
		privateKey: getInput("atlas-private-key", { required: true }),
		publicKey: getInput("atlas-public-key", { required: true }),
	};
}

export async function getIp(): Promise<string> {
	const res = await fetch("https://checkip.amazonaws.com");
	const body = await res.text();
	return body.trim();
}

/* eslint-disable @typescript-eslint/no-unsafe-argument -- spread of _array_ of any is safe */
export const logger: Logger = {
	debug(message?, ...optionalParams) {
		if (isDebug()) {
			debug(format(message, ...optionalParams));
		}
	},
	error(message?, ...optionalParams) {
		error(format(message, ...optionalParams));
	},
	info(message?, ...optionalParams) {
		info(format(message, ...optionalParams));
	},
	warn(message?, ...optionalParams) {
		warning(format(message, ...optionalParams));
	},
};
