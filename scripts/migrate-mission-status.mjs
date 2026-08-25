/**
 * One-off: converts the legacy two-state mission status to the three-state one.
 *
 *   open   → upcoming
 *   closed → ended
 *
 * Run once, from the PROJECT ROOT (C:\Users\pc\Desktop\ldd):
 *
 *   node scripts/migrate-mission-status.mjs
 *
 * Plain `node` does not read .env the way Next.js does, so this script loads
 * it itself — no dependency, no --env-file flag, works on any Node 18+.
 */
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

/* ------------------------------------------------------------------
   Minimal .env loader — same precedence Next.js uses
------------------------------------------------------------------- */
function loadEnv() {
  const candidates = [".env.local", ".env.development.local", ".env.development", ".env"];
  const loaded = [];

  for (const file of candidates) {
    const full = path.resolve(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    loaded.push(file);

    for (const rawLine of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const eq = line.indexOf("=");
      if (eq === -1) continue;

      const key = line.slice(0, eq).trim().replace(/^export\s+/, "");
      let value = line.slice(eq + 1).trim();

      // strip matching quotes, keeping anything inside them intact
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // earlier files win, matching Next.js precedence
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }

  return loaded;
}

const envFiles = loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("\n✖ MONGODB_URI not found.\n");
  console.error(`  Working directory : ${process.cwd()}`);
  console.error(`  Env files read    : ${envFiles.length ? envFiles.join(", ") : "none found"}\n`);
  console.error("  Fix one of these:");
  console.error("   1. Run from the project root, where your .env lives:");
  console.error("        cd C:\\Users\\pc\\Desktop\\ldd");
  console.error("        node scripts/migrate-mission-status.mjs");
  console.error("   2. Or pass it inline (PowerShell):");
  console.error('        $env:MONGODB_URI="mongodb+srv://..."; node scripts/migrate-mission-status.mjs\n');
  process.exit(1);
}

console.log(`Env loaded from: ${envFiles.join(", ") || "process environment"}`);
console.log("Connecting…");

await mongoose.connect(uri);

const Mission = mongoose.connection.collection("missions");

const before = {
  open: await Mission.countDocuments({ status: "open" }),
  closed: await Mission.countDocuments({ status: "closed" }),
  upcoming: await Mission.countDocuments({ status: "upcoming" }),
  active: await Mission.countDocuments({ status: "active" }),
  ended: await Mission.countDocuments({ status: "ended" }),
};
console.log("Before:", before);

if (before.open === 0 && before.closed === 0) {
  console.log("\n✔ Nothing to migrate — no legacy statuses left.");
} else {
  const toUpcoming = await Mission.updateMany({ status: "open" }, { $set: { status: "upcoming" } });
  const toEnded = await Mission.updateMany({ status: "closed" }, { $set: { status: "ended" } });

  console.log(`\n  open   → upcoming : ${toUpcoming.modifiedCount}`);
  console.log(`  closed → ended    : ${toEnded.modifiedCount}`);
  console.log("\n✔ Done.");
}

await mongoose.disconnect();
