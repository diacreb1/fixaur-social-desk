// First-contact purpose is stable across dates. Follow-ups need a separate,
// explicitly authorized workflow; they must not masquerade as new introductions.
export const PURPOSE = 'fixaur-fleet-introduction-v1';
const historical = x => Boolean(x.resendId) || ['sent','sending','unknown','uncertain','suppressed','canceled','cancelled','failed'].includes(String(x.status || '').toLowerCase());
const email = value => String(value || '').trim().toLowerCase();
export const draftKey = recipient => `${PURPOSE}:${email(recipient)}`;
export function selectCandidates(contacts, pending, snapshot, now, limit) {
  const time = Date.parse(now), asOf = Date.parse(snapshot?.asOf);
  if (snapshot?.reconciled !== true || !Number.isFinite(asOf) || !Number.isFinite(time) || asOf > time || time - asOf > 86400000 || !['sends','suppressions','eligibility'].every(k => Array.isArray(snapshot[k]))) {
    throw new Error('Fresh reconciled send, uncertain-outcome, suppression and eligibility history is required');
  }
  if (!Number.isInteger(limit) || limit < 0 || limit > 10) throw new Error('Invalid draft limit');
  const blocked = new Set([...pending, ...snapshot.sends, ...snapshot.suppressions].map(x => email(x.recipient || x.email)));
  return contacts.filter(contact => {
    const recipient = email(contact.email);
    if (!recipient || !recipient.includes('@') || contact.emailStatus !== 'verified' || blocked.has(recipient)) return false;
    const evidence = snapshot.eligibility.find(x => email(x.recipient) === recipient && x.purpose === PURPOSE && x.eligible === true && Date.parse(x.validUntil) > time && /^https:\/\//.test(x.sourceUrl || ''));
    if (!evidence) return false;
    blocked.add(recipient);
    return true;
  }).slice(0, limit);
}
// Existing records are authoritative for edits/history. Never replace a sent,
// uncertain, suppressed or pending record with a daily-generated draft.
export function mergeOutreach(existing, incoming) {
  const result = [...existing];
  const seen = new Set(existing.map(x => email(x.email)).filter(Boolean));
  for (const draft of incoming) {
    const recipient = email(draft.email);
    if (!recipient) continue;
    if (seen.has(recipient)) {
      const index = result.findIndex(x => email(x.email) === recipient);
      if (historical(draft) && !historical(result[index])) result[index] = {...draft};
      continue;
    }
    seen.add(recipient);
    result.push(historical(draft) ? {...draft} : {...draft, status: 'Draft'});
  }
  return result;
}
