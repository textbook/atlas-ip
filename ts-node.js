// Avoid "ExperimentalWarning: `--experimental-loader` may be removed in the future"
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("ts-node/esm", pathToFileURL("./"));
