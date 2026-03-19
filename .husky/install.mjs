// Skip Husky install in production and CI to avoid failures when devDependencies
// aren't installed, which is common in Docker and some CI environments.
if (process.env.NODE_ENV === "production" || process.env.CI === "true") {
	process.exit(0);
}

const husky = (await import("husky")).default;

console.log(husky());
