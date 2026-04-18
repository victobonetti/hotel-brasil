/** biome-ignore-all assist/source/useSortedKeys: Order matters here */
import { execSync } from "node:child_process";
import type { PlopTypes } from "@turbo/gen";

interface PackageJson {
	name: string;
	scripts: Record<string, string>;
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
	plop.setGenerator("init", {
		description: "Generate a new package for the Acme Monorepo",
		prompts: [
			{
				type: "input",
				name: "name",
				message:
					"What is the name of the package? (You can skip the `@nowait24/` prefix)",
			},
			{
				type: "input",
				name: "deps",
				message:
					"Enter a space separated list of dependencies you would like to install",
			},
		],
		actions: [
			(answers) => {
				if (
					"name" in answers &&
					typeof answers.name === "string" &&
					answers.name.startsWith("@nowait24/")
				) {
					answers.name = answers.name.replace("@nowait24/", "");
				}
				return "Config sanitized";
			},
			{
				type: "add",
				path: "packages/{{ name }}/package.json",
				templateFile: "templates/package.json.hbs",
			},
			{
				type: "add",
				path: "packages/{{ name }}/tsconfig.json",
				templateFile: "templates/tsconfig.json.hbs",
			},
			{
				type: "add",
				path: "packages/{{ name }}/src/index.ts",
				template: "export const name = '{{ name }}';",
			},
			{
				type: "modify",
				path: "packages/{{ name }}/package.json",
				async transform(content, answers) {
					if ("deps" in answers && typeof answers.deps === "string") {
						const pkg = JSON.parse(content) as PackageJson;
						for (const dep of answers.deps.split(" ").filter(Boolean)) {
							const version = await fetch(
								`https://registry.npmjs.org/-/package/${dep}/dist-tags`,
							)
								.then((res) => res.json())
								.then((json) => json.latest);
							if (!pkg.dependencies) {
								pkg.dependencies = {};
							}
							pkg.dependencies[dep] = `^${version}`;
						}
						return JSON.stringify(pkg, null, 2);
					}
					return content;
				},
			},
			async (answers) => {
				if ("name" in answers && typeof answers.name === "string") {
					execSync("bun i", { stdio: "inherit" });
					execSync(`bun check --write packages/${answers.name}`, {
						stdio: "inherit",
					});
					return "Package scaffolded";
				}
				return "Package not scaffolded";
			},
		],
	});
}
