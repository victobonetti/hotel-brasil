const processHandle = Bun.spawn([process.execPath, "next", "build"], {
	env: {
		...process.env,
		NODE_ENV: "production",
	},
	stdio: ["inherit", "inherit", "inherit"],
});

const exitCode = await processHandle.exited;

if (exitCode !== 0) {
	process.exit(exitCode);
}
