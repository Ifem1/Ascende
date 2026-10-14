import { parseGen } from "./genlayer";

const MAX_U256 = 1n << 256n;
const MAX_EVIDENCE_BYTES = 64 * 1024;

export type FrozenAuthority = { prefix: string; required: boolean };

export function isValidAuthorityPrefix(prefix: string): boolean {
  if (!prefix.startsWith("https://") || prefix.length > 300 || !prefix.endsWith("/")) return false;
  if (/[\u0000-\u0020\u007f?#\\%]/.test(prefix)) return false;
  if (!/^[\x00-\x7f]*$/.test(prefix)) return false;
  const match = /^https:\/\/((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?::443)?)(\/.*)$/.exec(prefix);
  return Boolean(match && !match[2].split("/").some((part) => part === "." || part === ".."));
}

export function validateEvidenceEntry(url: string, sha256: string, byteLength: string, authorities: FrozenAuthority[]): { url: string; sha256: string; byte_length: number } {
  if (!/^https:\/\//.test(url) || url.length > 500 || /[\u0000-\u0020\u007f?#\\%]/.test(url)) throw new Error("Enter an authorized HTTPS evidence URL without query, fragment, encoded path or user-info.");
  const match = /^https:\/\/((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}(?::443)?)(\/.*)$/.exec(url);
  if (!match || !/^[\x00-\x7f]*$/.test(url) || match[2].split("/").some((part) => part === "." || part === "..")) throw new Error("Evidence URL is malformed or contains an unsafe path.");
  if (!/^[0-9a-fA-F]{64}$/.test(sha256)) throw new Error("Enter the complete 64-character SHA-256 digest.");
  if (!/^[1-9][0-9]*$/.test(byteLength)) throw new Error("Enter the exact positive byte length.");
  const length = Number(byteLength);
  if (!Number.isSafeInteger(length) || length > MAX_EVIDENCE_BYTES) throw new Error("Evidence must be no larger than 64 KiB.");
  const matched = authorities.filter(({ prefix }) => url.startsWith(prefix));
  if (matched.length !== 1) throw new Error("Evidence URL must match exactly one frozen source authority.");
  if (authorities.some(({ prefix, required }) => required && !url.startsWith(prefix))) throw new Error("Submit an evidence URL for every required frozen authority.");
  return { url, sha256: sha256.toLowerCase(), byte_length: length };
}

export function validateCreationPreflight(input: {
  recipient: string;
  funder: string;
  tranches: bigint[];
  authorities: string[];
}): bigint {
  if (!/^0x[0-9a-fA-F]{40}$/.test(input.recipient) || /^0x0{40}$/i.test(input.recipient)) throw new Error("Enter a valid nonzero recipient address.");
  if (input.funder && input.recipient.toLowerCase() === input.funder.toLowerCase()) throw new Error("Funder and recipient must be different addresses.");
  if (input.tranches.length < 2 || input.tranches.length > 5 || input.tranches.some((amount) => amount <= 0n || amount >= MAX_U256)) throw new Error("Each of 2–5 milestones needs a positive tranche within the contract's u256 limit.");
  if (input.authorities.length !== input.tranches.length || input.authorities.some((prefix) => !isValidAuthorityPrefix(prefix))) throw new Error("Every milestone needs a valid frozen HTTPS authority path ending in /.");
  const total = input.tranches.reduce((sum, amount) => sum + amount, 0n);
  if (total <= 0n || total >= MAX_U256) throw new Error("Total program funding exceeds the contract's u256 limit.");
  return total;
}

export function parsePositiveGen(value: string): bigint {
  const amount = parseGen(value);
  if (amount <= 0n || amount >= MAX_U256) throw new Error("Enter a positive GEN amount within the contract's u256 limit.");
  return amount;
}
