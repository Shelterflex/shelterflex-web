/**
 * Blocks `pnpm install` / `yarn install` with an actionable message.
 *
 * This project commits package-lock.json and CI runs `npm ci`. Installing
 * with pnpm or yarn resolves from package.json ranges instead of the
 * lockfile, producing a different dependency tree than CI — the classic
 * "works on my machine" failure, and one that gives no error at the moment it
 * happens. Failing here turns a silent divergence into an obvious one.
 *
 * Runs as a `preinstall` script, so it only fires on install. Every `npm run`
 * command (dev, build, lint, test) is unaffected and works normally.
 *
 * Deliberately dependency-free — no extra package needed to check this.
 */

const agent = process.env.npm_config_user_agent ?? "";
const name = agent.split("/")[0];

// npm_config_user_agent is unset when node runs the file directly, which is not
// an install. Only block when a non-npm package manager is actually installing.
if (agent !== "" && !agent.startsWith("npm")) {
  const red = "[31m";
  const bold = "[1m";
  const reset = "[0m";

  console.error(`
${red}${bold}  This project uses npm, not ${name}.${reset}

  Detected: ${name}

  Install dependencies with:

    ${bold}npm install${reset}

  Why: package-lock.json is the committed lockfile and CI runs
  \`npm ci\`. Installing with ${name} resolves a different dependency tree
  than CI, and nothing warns you when it happens.

  Note: only the install step needs npm. \`npm run dev\`, \`npm run build\`,
  \`npm run lint\` and \`npm test\` all keep working as normal.
`);

  process.exit(1);
}
