// Sending is held until authenticated, exact-version server approval and
// authoritative recipient-history reconciliation exist. Never trust approved:true
// or the publicly writable generic state endpoint. No provider/DB side effects.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error: "Method not allowed"});
  return res.status(409).json({
    code: "OUTREACH_REVIEW_REQUIRED",
    error: "Sending held: authenticated approval and reconciled recipient history are required. No email was sent."
  });
}
