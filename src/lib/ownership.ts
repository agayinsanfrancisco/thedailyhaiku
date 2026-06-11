import { createHash, randomBytes } from "crypto";

// No-login ownership: the poet holds a secret token (in their browser /
// a manage link); we store only its hash. Whoever presents a token whose
// hash matches owns that haiku and may edit or delete it.

export function newManageToken(): { token: string; hash: string } {
  const token = randomBytes(24).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Constant-time-ish compare via fixed-length hashes.
export function tokenMatches(token: string | null | undefined, storedHash: string | null | undefined): boolean {
  if (!token || !storedHash) return false;
  return hashToken(token) === storedHash;
}
