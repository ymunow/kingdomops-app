// Minimal AI PR review bot
// - Gathers changed files + patches for the PR
// - Sends a compact prompt to OpenAI
// - Posts a single review comment back on the PR

const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");
const { OpenAI } = require("openai");

async function run() {
  const token = process.env.GITHUB_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!token) throw new Error("Missing GITHUB_TOKEN");
  if (!openaiKey) throw new Error("Missing OPENAI_API_KEY");

  const octokit = new Octokit({ auth: token });
  const client = new OpenAI({ apiKey: openaiKey });

  const { owner, repo } = github.context.repo;
  const prNumber = github.context.payload.pull_request.number;

  // Get changed files (limit to ~100 for safety)
  const files = await octokit.paginate(octokit.pulls.listFiles, {
    owner, repo, pull_number: prNumber, per_page: 100,
  });

  // Build compact diffs
  const diffs = files
    .map(f => `# ${f.filename}\n${f.patch || "(no patch)"}\n`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: "You are a senior engineer reviewing code." },
      { role: "user", content: diffs.slice(0, 180000) }
    ],
  });

  const reviewBody = response.choices?.[0]?.message?.content?.trim() || "AI review failed.";

  await octokit.issues.createComment({
    owner, repo, issue_number: prNumber, body: `### 🤖 AI Code Review\n\n${reviewBody}`
  });

  console.log("AI review posted.");
}

run().catch(err => {
  core.setFailed(err.message);
  console.error(err);
});
