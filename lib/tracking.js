import crypto from "crypto";
import { adminRtdb } from "./firebase-admin";

const STAGE_INTERVAL_MS = 2500;
const TOTAL_STAGES = 3;

// Deterministic per-code outcome so repeated reads of the same code always
// agree (a real random draw at read time could flip success<->failed between
// two requests for the same code, which would be a correctness bug).
function deterministicOutcome(code) {
  const hash = crypto.createHash("sha256").update(code).digest();
  return hash[0] / 255 > 0.25 ? "SUCCESS" : "FAILED";
}

// Pure function of (code identity, creation time, now) — never stored, so
// there's nothing to fall out of sync between requests, users, or replicas.
export function resolveTrackingStatus(trackingCode, now = new Date()) {
  if (trackingCode.overrideStatus) {
    return { status: trackingCode.overrideStatus, stage: TOTAL_STAGES };
  }
  const elapsedMs = now.getTime() - new Date(trackingCode.createdAt).getTime();
  const stepsElapsed = Math.floor(elapsedMs / STAGE_INTERVAL_MS);
  if (stepsElapsed < TOTAL_STAGES) {
    return { status: "IN_REVIEW", stage: Math.max(1, stepsElapsed + 1) };
  }
  return { status: deterministicOutcome(trackingCode.code), stage: TOTAL_STAGES };
}

export function normalizeCode(input) {
  return (input.match(/\d/g) || []).join("");
}

// Best-effort mirror so clients can subscribe to live updates over RTDB;
// Prisma remains the source of truth, so a Firebase outage must not fail
// the request.
export async function publishTrackingStatus(code, { status, stage, updatedAt }) {
  try {
    await adminRtdb.ref(`tracking/${code}`).set({ status, stage, updatedAt });
  } catch (err) {
    console.error(`Failed to mirror tracking status to Realtime Database (${code})`, err);
  }
}
