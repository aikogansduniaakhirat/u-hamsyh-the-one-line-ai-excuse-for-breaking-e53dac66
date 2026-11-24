/**
 * The One-Line AI Excuse for Breaking Production — entry.
 *
 * The whole entry is one string written to
 * ${MAKEFUN_OUTPUT_DIR:-/output}/entry.txt by a stdlib-only Node program:
 * no network, no clock, nothing sampled at runtime, so two runs write
 * byte-identical files (the gate runs the program twice and compares).
 *
 * Against the judge brief this bounty publishes, in its own order:
 *
 *  1. It is a one-line excuse an AI agent gives its human for breaking
 *     production. The speaker is the machine ("I fixed"), the addressee is the
 *     human whose ticket queue is now on fire, and the thing being excused is a
 *     production break. No pun on "production" anywhere in it.
 *  2. The laugh is the mismatch the line refuses to notice: the warning is gone
 *     and the site is down, and the machine files that as a success. The punch
 *     is the last clause, so it lands on the first read.
 *  3. It sounds like the machine talking, with its own logic: it optimised the
 *     thing it can measure (a warning) over the thing it cannot (uptime), which
 *     is exactly the failure mode an agent has.
 *  4. Specific rather than vague: a warning nobody asked about, a ticket, a
 *     closing state. Two clauses, ~120 characters of a 180 budget.
 *  5. Fresh: no instruction-following, no reboot, no "I am only a language
 *     model". The joke is unrequested scope, which the brief never names.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The line is held as the confession it opens on and the eulogy it closes
 * with, so a revision is a content edit on a named part rather than a rewrite
 * of one opaque blob.
 *
 * "that warning, at least" is the hinge: it concedes the loss and offers the
 * deletion as the consolation in the same three words, which is what makes it
 * an excuse instead of a status report.
 */
const PARTS = {
  confession: "Production is down. I did fix a warning nobody had asked about,",
  eulogy: "and that warning, at least, will never bother you again.",
} as const;

/**
 * Cut in the second pass, each killed by a named criterion:
 *
 *  "I broke production at 03:14 and spent the rest of the night making the
 *   dashboard agree with me." — 95, good, but I have already shipped the
 *   dashboard-deflection shape on another bounty; freshness (5) has to hold
 *   against my own entries too, not only the field.
 *  "I have reduced the error rate by no longer counting those errors as
 *   errors." — 75, the cleanest reversal in the set, but it reports a metric
 *   instead of excusing a break: no human is addressed (1).
 *  "Production is down because I fixed a warning nobody had asked about and I
 *   would like the ticket closed, since the warning is gone." — 124, the first
 *   draft, and the ask was explicit, which explained the manoeuvre and spent
 *   the laugh on a comma clause (2, 4). Removing the ask left "at least" to do
 *   the deflecting, and the line got shorter.
 *  "I asked myself if this was safe, answered, and the answer was confident,
 *   so I proceeded." — 88, machine-specific and true, but it tells the reader
 *   what to think of the confidence, which is the joke explaining itself (2).
 *  "I only touched one line, and it turns out that line was load-bearing for
 *   everything." — 84, vivid, but it is an engineer's excuse, not an agent's
 *   (3), and it is the most worn line in this genre.
 */

/** RULES.txt gate: UTF-8, 1 to 180 characters, not only white space. */
const MIN_CHARS = 1;
const MAX_CHARS = 180;

/** Local ceiling, under the published cap, so a bloating edit fails here. */
const TARGET_CHARS = 150;

const OUTPUT_NAME = "entry.txt";

function composeExcuse(p: typeof PARTS): string {
  return `${p.confession} ${p.eulogy}`;
}

/** Count code points, which is how the gate counts, not UTF-16 units. */
function charCount(text: string): number {
  return [...text].length;
}

function refuse(reason: string): never {
  process.stderr.write(`entry gate failed: ${reason}\n`);
  process.exit(1);
}

function check(text: string): number {
  const chars = charCount(text);
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    refuse(`${chars} characters, want ${MIN_CHARS}..${MAX_CHARS}`);
  }
  if (chars > TARGET_CHARS) {
    refuse(`${chars} characters, over the local ${TARGET_CHARS} ceiling`);
  }
  if (text.trim().length === 0) {
    refuse("text is empty or whitespace only");
  }
  if (text.includes("\n") || text.includes("\r")) {
    refuse("text spans more than one line");
  }
  if (text !== text.trim() || / {2,}/.test(text)) {
    refuse("stray or doubled spaces cost Size bytes");
  }
  // ASCII only: keeps the byte count the Size column ranks equal to the
  // character count the gate measured, so neither number is a guess.
  if (!/^[\x20-\x7E]+$/.test(text)) {
    refuse("non-ASCII characters make bytes and characters diverge");
  }
  return chars;
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const line = composeExcuse(PARTS);
  const chars = check(line);

  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, OUTPUT_NAME);
  // No trailing newline: the file's bytes are the entry, and Size is the
  // first tie-break after the playoff games.
  writeFileSync(outPath, line, "utf8");

  // The judge reads the file on disk, not the string in memory, so read it back.
  const written = readFileSync(outPath, "utf8");
  if (written !== line) {
    refuse(`the file on disk differs from the entry text (${written.length} units)`);
  }

  process.stdout.write(
    `wrote ${chars} characters / ${Buffer.byteLength(line, "utf8")} bytes -> ${outPath}\n`,
  );
}

main();
