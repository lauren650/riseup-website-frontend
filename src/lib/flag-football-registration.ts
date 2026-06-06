/** Girls Flag 2026 registration window (local calendar dates, Moore County NC). */
const OPEN_DATE = new Date(2026, 5, 15); // June 15, 2026
const FIRST_CLOSED_DATE = new Date(2026, 8, 2); // Sept 2 — hard close end of Sept 1

export type FlagRegistrationPhase = 'before' | 'open' | 'closed';

export function getFlagRegistrationPhase(now = new Date()): FlagRegistrationPhase {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today < OPEN_DATE) return 'before';
  if (today < FIRST_CLOSED_DATE) return 'open';
  return 'closed';
}

export const GIRLS_FLAG_EMAIL = 'girlsflag@riseupfootball.org';
