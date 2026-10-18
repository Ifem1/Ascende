import { parseGen } from "./genlayer";

const MAX_U256 = 1n << 256n;
const MAX_EVIDENCE_BYTES = 64 * 1024;

export type FrozenAuthority = { prefix: string; required: boolean };
export type EvidenceInput = { url: string; sha256: string; byteLength: string };
export type CreationAuthority = string | FrozenAuthority;

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
  return { url, sha256: sha256.toLowerCase(), byte_length: length };
}

export function validateEvidenceManifest(entries: EvidenceInput[], authorities: FrozenAuthority[]) {
  if (entries.length > authorities.length) throw new Error("Evidence has more rows than the frozen authority policy.");
  const manifest: Array<{ url: string; sha256: string; byte_length: number }> = [];
  const matched: number[] = [];
  for (let index = 0; index < authorities.length; index += 1) {
    const entry = entries[index] ?? { url: "", sha256: "", byteLength: "" };
    const empty = !entry.url.trim() && !entry.sha256.trim() && !entry.byteLength.trim();
    if (empty && !authorities[index].required) continue;
    if (!entry.url.trim() || !entry.sha256.trim() || !entry.byteLength.trim()) throw new Error(`Complete all evidence fields for ${authorities[index].required ? "required" : "optional"} authority ${index + 1}, or leave an optional authority blank.`);
    const validated = validateEvidenceEntry(entry.url, entry.sha256, entry.byteLength, authorities);
    const authorityIndex = authorities.findIndex(({ prefix }) => validated.url.startsWith(prefix));
    if (authorityIndex !== index) throw new Error("Each evidence row must match its corresponding frozen authority.");
    manifest.push(validated);
    matched.push(authorityIndex);
  }
  if (matched.some((index) => index < 0) || new Set(matched).size !== matched.length || authorities.some((authority, index) => authority.required && !matched.includes(index))) throw new Error("Submit exactly one item for every required frozen authority.");
  if (manifest.reduce((sum, entry) => sum + entry.byte_length, 0) > 128 * 1024) throw new Error("Combined evidence must be no larger than 128 KiB.");
  return manifest;
}

export function validateCreationPreflight(input: {
  recipient: string;
  funder: string;
  tranches: bigint[];
  authorities: CreationAuthority[][];
}): bigint {
  if (!/^0x[0-9a-fA-F]{40}$/.test(input.recipient) || /^0x0{40}$/i.test(input.recipient)) throw new Error("Enter a valid nonzero recipient address.");
  if (input.funder && input.recipient.toLowerCase() === input.funder.toLowerCase()) throw new Error("Funder and recipient must be different addresses.");
  if (input.tranches.length < 2 || input.tranches.length > 5 || input.tranches.some((amount) => amount <= 0n || amount >= MAX_U256)) throw new Error("Each of 2–5 milestones needs a positive tranche within the contract's u256 limit.");
  if (input.authorities.length !== input.tranches.length || input.authorities.some((rules) => {
    const normalized = rules.map((rule) => typeof rule === "string" ? { prefix: rule, required: true } : rule);
    return normalized.length < 2 || normalized.length > 4 || normalized.some(({ prefix }) => !isValidAuthorityPrefix(prefix))
      || new Set(normalized.map(({ prefix }) => new URL(prefix).hostname)).size !== normalized.length
      || normalized.filter(({ required }) => required).length < 2;
  })) throw new Error("Every milestone needs 2–4 distinct HTTPS authorities and at least two required authorities.");
  const total = input.tranches.reduce((sum, amount) => sum + amount, 0n);
  if (total <= 0n || total >= MAX_U256) throw new Error("Total program funding exceeds the contract's u256 limit.");
  return total;
}

export function parsePositiveGen(value: string): bigint {
  const amount = parseGen(value);
  if (amount <= 0n || amount >= MAX_U256) throw new Error("Enter a positive GEN amount within the contract's u256 limit.");
  return amount;
}
