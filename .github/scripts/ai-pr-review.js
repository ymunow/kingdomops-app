// ESM version — works with "type": "module" in package.json

import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";
import OpenAI from "openai";

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
  const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
    owner, repo, pull_number: prNumber, per_page: 100,
  });

  // Build a compact diff payload (skip huge/binary files if you like)
  const diffs = files
    .filter(f =>
      f.status !== "removed" &&
      f.changes <= 5000 &&
      !/\.lock$|\.min\.(?:js|css)$|\.png$|\.jpe?g$|\.gif$|\.svg$|\.pdf$|\.mp4$|\.zip$/.test(f.filename)
    )
    .map(f => `# ${f.filename}\n${f.patch || "(no patch)"}\n`)
    .join("\n");

  const system = `
You are a senior full-stack engineer reviewing a pull request for a TypeScript/Node + React app (church management platform).
Be precise and practical. Focus on:
- correctness, security, performance, accessibility
- API/DB contract mismatches
- error handling & edge cases
- maintainability (naming, duplication, tests)
- clear, actionable suggestions with exact code snippets when useful.
If everything looks good, say so and suggest small polish items.
Output in GitHub Markdown. Use short sections with bullet points.
`;

  const userPrompt = `
PR: https://github.com/${owner}/${repo}/pull/${prNumber}
Changed files and patches:
${diffs.slice(0, 180000)}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ],
  });

  const reviewBody =
    response.choices?.[0]?.message?.content?.trim() ||
    "AI review failed to generate.";

  await octokit.rest.issues.createComment({
    owner, repo, issue_number: prNumber,
    body: `### 🤖 AI Code Review\n\n${reviewBody}`,
  });

  console.log("AI review posted.");
}

run().catch(err => {
  core.setFailed(err.message);
  console.error(err);
});

