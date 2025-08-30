// Minimal AI PR review bot (ESM).
// – Collects changed files + patches for this PR
// – Sends a compact prompt to OpenAI
// – Posts a single review comment back to the PR

import core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";
import OpenAI from "openai";

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!token) throw new Error("Missing GITHUB_TOKEN");
    if (!openaiKey) throw new Error("Missing OPENAI_API_KEY");

    const octokit = new Octokit({ auth: token });
    const client = new OpenAI({ apiKey: openaiKey });

    const { owner, repo } = github.context.repo;
    const prNumber = github.context.payload.pull_request?.number;
    if (!prNumber) throw new Error("No PR number in context.");

    // Get changed files
    const files = await octokit.paginate(octokit.rest.pulls.listFiles, {
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    // Build diffs (limit size to avoid token overload)
    const diffs = files
      .map(
        (f) =>
          `# ${f.filename}\n${f.patch || "(no patch)"}\n`
      )
      .join("\n")
      .slice(0, 180000); // ~180k chars max

    // Ask OpenAI for review
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a senior engineer reviewing code." },
        { role: "user", content: diffs },
      ],
    });

    const reviewBody =
      response.choices?.[0]?.message?.content?.trim() ||
      "AI review failed to generate output.";

    // Post as a PR comment
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: `### 🤖 AI Code Review\n\n${reviewBody}`,
    });

    console.log("AI review posted.");
  } catch (err) {
    core.setFailed(err.message);
    console.error(err);
  }
}

run();
