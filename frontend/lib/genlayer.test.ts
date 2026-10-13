import { describe, expect, it } from "vitest";
import { formatGen, parseGen, requireDeployment } from "./genlayer";
import { normalizedChainId, TARGET_CHAIN_NUMBER } from "./network";

describe("GEN amount conversion", () => {
  it("uses exact 18-decimal integer arithmetic", () => {
    expect(parseGen("3")).toBe(3n * 10n ** 18n);
    expect(parseGen("0.000000000000000001")).toBe(1n);
    expect(formatGen(1230000000000000000n)).toBe("1.23");
  });

  it("rejects imprecise or malformed values", () => {
    for (const value of ["", "-1", "01", "1e3", "1.0000000000000000001", "1."]) {
      expect(() => parseGen(value)).toThrow();
    }
  });
});

describe("network and deployment guards", () => {
  it("normalizes Studionet to the expected chain id", () => {
    expect(TARGET_CHAIN_NUMBER).toBe(61999);
    expect(normalizedChainId("61999")).toBe("0xf22f");
    expect(normalizedChainId("0xF22F")).toBe("0xf22f");
    expect(normalizedChainId("invalid")).toBe("");
  });

  it("refuses reads until a valid contract address is configured", () => {
    expect(() => requireDeployment()).toThrow(/not deployed/i);
  });
});
