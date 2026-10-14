import { describe, expect, it } from "vitest";
import { isValidAuthorityPrefix, parsePositiveGen, validateCreationPreflight, validateEvidenceEntry } from "./preflight";

const authority = "https://evidence.example/project/";

describe("evidence preflight", () => {
  it("accepts an exact committed source and normalizes its digest", () => {
    expect(validateEvidenceEntry(`${authority}record.json`, "A".repeat(64), "42", [{ prefix: authority, required: true }])).toEqual({
      url: `${authority}record.json`, sha256: "a".repeat(64), byte_length: 42,
    });
  });

  it("rejects malformed, unsafe, oversized and out-of-authority manifests before prepare", () => {
    const valid = `${authority}record.json`;
    for (const badUrl of ["", "http://evidence.example/project/record", "https://evidence.example@evil.test/project/file", `${authority}%2e%2e/file`, `${authority}../file`, `${authority}record?x=1`, "https://evidence.example/project-evil/file"]) {
      expect(() => validateEvidenceEntry(badUrl, "a".repeat(64), "1", [{ prefix: authority, required: true }])).toThrow();
    }
    expect(() => validateEvidenceEntry(valid, "abc", "1", [{ prefix: authority, required: true }])).toThrow(/SHA-256/);
    expect(() => validateEvidenceEntry(valid, "a".repeat(64), "0", [{ prefix: authority, required: true }])).toThrow(/byte length/);
    expect(() => validateEvidenceEntry(valid, "a".repeat(64), "65537", [{ prefix: authority, required: true }])).toThrow(/64 KiB/);
    expect(() => validateEvidenceEntry(valid, "a".repeat(64), "1", [{ prefix: authority, required: true }, { prefix: "https://other.example/", required: true }])).toThrow(/every required/);
  });

  it("rejects deceptive frozen source prefixes", () => {
    for (const value of ["http://example.com/", "https://user@example.com/", "https://example.com/%2e/", "https://example.com/a/../", "https://example.com/path?x=/"]) expect(isValidAuthorityPrefix(value)).toBe(false);
    expect(isValidAuthorityPrefix(authority)).toBe(true);
  });
});

describe("payable creation preflight", () => {
  const base = { recipient: "0x1111111111111111111111111111111111111111", funder: "0x2222222222222222222222222222222222222222", tranches: [1n, 2n], authorities: [authority, authority] };

  it("uses exact integer totals and rejects equality, zero and overflow", () => {
    expect(validateCreationPreflight(base)).toBe(3n);
    expect(() => validateCreationPreflight({ ...base, funder: base.recipient })).toThrow(/different addresses/);
    expect(() => validateCreationPreflight({ ...base, tranches: [0n, 1n] })).toThrow(/positive tranche/);
    expect(() => validateCreationPreflight({ ...base, tranches: [(1n << 256n) - 1n, 1n] })).toThrow(/positive tranche|u256/);
    expect(() => validateCreationPreflight({ ...base, recipient: "0x0000000000000000000000000000000000000000" })).toThrow(/nonzero/);
  });

  it("accepts only positive exact GEN amount strings", () => {
    expect(parsePositiveGen("0.000000000000000001")).toBe(1n);
    for (const amount of ["0", "-1", "01", "1e3", "1.0000000000000000001"]) expect(() => parsePositiveGen(amount)).toThrow();
  });
});
