import cyf from "@codeyourfuture/eslint-config-standard";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
	...cyf.configs.standard,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			globals: globals.node,
			parserOptions: {
				project: true,
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: "error",
		},
	},
	{
		files: ["**/*.js"],
		...tseslint.configs.disableTypeChecked,
	},
	{
		files: ["**/*.test.ts"],
		rules: {
			"@typescript-eslint/no-floating-promises": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
		},
	},
	{
		ignores: ["packages/atlas-ip/lib", "packages/action/main", "packages/action/post"],
	},
];
