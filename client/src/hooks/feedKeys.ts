// Canonical query keys for feed operations
export const feedKey = (scope: "church" | "group", visibility: "members" | "public") =>
  ["feed", scope, visibility] as const;