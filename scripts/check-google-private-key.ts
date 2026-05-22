#!/usr/bin/env tsx
/**
 * Checks GOOGLE_PRIVATE_KEY from .env.local without printing the key.
 * Run: npx tsx scripts/check-google-private-key.ts
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const raw = process.env.GOOGLE_PRIVATE_KEY;

console.log("GOOGLE_PRIVATE_KEY check (key itself is not printed):\n");

if (!raw) {
  console.log("❌ GOOGLE_PRIVATE_KEY is not set in .env.local");
  process.exit(1);
}

const len = raw.length;
// A valid PEM key is typically 4+ lines and 400+ chars; 94 chars = "-----BEGIN...-----" + one short line
const likelyTruncated = len < 200;
const hasBegin = raw.includes("-----BEGIN PRIVATE KEY-----");
const hasEnd = raw.includes("-----END PRIVATE KEY-----");
const backslashN = (raw.match(/\\n/g) || []).length;
const actualNewlines = (raw.match(/\n/g) || []).length;
const afterReplace = raw.replace(/\\n/g, "\n");
const hasActualNewlinesAfter = afterReplace.includes("\n");

console.log(`  Length: ${len} characters${likelyTruncated ? " (too short – key is likely truncated)" : ""}`);
console.log(`  Contains "-----BEGIN PRIVATE KEY-----": ${hasBegin ? "✓" : "❌"}`);
console.log(`  Contains "-----END PRIVATE KEY-----": ${hasEnd ? "✓" : "❌"}`);
console.log(`  Literal \\n (backslash-n) count: ${backslashN}`);
console.log(`  Actual newline count in raw value: ${actualNewlines}`);
console.log(`  After .replace(/\\\\n/g, '\\n'), has newlines: ${hasActualNewlinesAfter ? "✓" : "❌"}`);

if (!hasBegin || !hasEnd) {
  console.log("\n❌ Key must include both BEGIN and END lines.");
  process.exit(1);
}

// Multi-line key: only treat as truncated if length is too short (some .env loaders read multiline quoted values)
const fullKeyLength = len >= 400;
if (actualNewlines > 0 && backslashN === 0) {
  if (!fullKeyLength) {
    console.log("\n⚠️  The key in .env.local is split across multiple lines.");
    console.log("   Only the first line was read (" + len + " chars), so the key is truncated.");
    console.log("   Fix: Put the entire key on ONE line, using backslash-n for line breaks.");
    console.log('   Example: GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\n"');
    process.exit(1);
  }
  console.log("\n✓ Key is multi-line in .env (full length). This is valid; Google Auth accepts it.");
}

if (backslashN === 0 && !hasActualNewlinesAfter) {
  console.log("\n❌ Key has no \\n sequences. It should be one long line with \\n where line breaks go.");
  console.log('   Copy from the JSON "private_key" value (it already has \\n in it).');
  process.exit(1);
}

if (len < 100) {
  console.log("\n❌ Key looks too short; it may be truncated.");
  process.exit(1);
}

console.log("\n✓ Format looks OK. If auth still fails, try using the JSON file path instead (see README).");
process.exit(0);
