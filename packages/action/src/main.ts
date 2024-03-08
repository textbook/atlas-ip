import { context } from "@actions/github";
import { getInput, saveState, setOutput } from "@actions/core";
import Atlas from "@textbook/atlas-ip";

import { getCredentials, getIp, logger } from "./utils.js";

const groupId = getInput("group-id", { required: true });
const workflow = `${context.repo.owner}/${context.repo.repo} - ${context.job} - ${context.runId}`;

const ipAddress = await getIp();
setOutput("ip-address", ipAddress);

await Atlas
	.create(getCredentials(), logger)
	.permit(groupId, ipAddress, workflow);

saveState("permitted-ip", ipAddress);
