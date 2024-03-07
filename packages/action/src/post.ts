import { getInput, getState } from "@actions/core";
import Atlas from "@textbook/atlas-ip";

import { getCredentials, logger } from "./utils.js";

const groupId = getInput("group-id", { required: true });
const ipAddress = getState("permitted-ip");

if (ipAddress) {
	await Atlas
		.create(getCredentials(), logger)
		.revoke(groupId, ipAddress);
}
