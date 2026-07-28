// Aggregate totals are always derived from the per-day history object, never
// kept as a separate stored counter, so the per-day breakdown and the
// headline numbers can never drift apart.
export function sumHistory(history) {
  return Object.values(history || {}).reduce(
    (acc, day) => {
      acc.logins += day.logins?.length || 0;
      acc.attempts += day.attempts || 0;
      acc.success += day.success || 0;
      acc.failed += day.failed || 0;
      acc.inReview += day.inReview || 0;
      acc.suspicious += day.suspicious || 0;
      acc.liveChat += day.liveChat || 0;
      return acc;
    },
    { logins: 0, attempts: 0, success: 0, failed: 0, inReview: 0, suspicious: 0, liveChat: 0 }
  );
}
