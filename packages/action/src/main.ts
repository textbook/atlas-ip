import { context } from "@actions/github";
import { getInput, saveState, setOutput } from "@actions/core";
import Atlas from "@textbook/atlas-ip";

import { getCredentials, getIp, logger } from "./utils.js";

const defaultComment = `${context.repo.owner}/${context.repo.repo} - ${context.job} - ${context.runId}`;

const groupId = getInput("group-id", { required: true });
const comment = getInput("comment") || defaultComment;

const ipAddress = await getIp();
setOutput("ip-address", ipAddress);

await Atlas
	.create(getCredentials(), logger)
	.permit(groupId, ipAddress, comment);

saveState("permitted-ip", ipAddress);
