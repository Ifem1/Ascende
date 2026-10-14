import { describe, expect, it } from "vitest";
import { formatGen, parseGen, requireDeployment } from "./genlayer";
import { normalizedChainId, TARGET_CHAIN_NUMBER } from "./network";
import { recoveryActions } from "./capabilities";

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

describe("contract-gated milestone recovery actions", () => {
  it("shows expiry and unresolved close only for eligible on-chain states", () => {
    const eligible = { can_expire: true, can_finalize_unresolved: true, can_close: false };
    expect(recoveryActions("OPEN", eligible)).toEqual({ expire: true, finalizeUnresolved: false, close: false });
    expect(recoveryActions("CHALLENGE_RETRYABLE", eligible)).toEqual({ expire: false, finalizeUnresolved: true, close: false });
    expect(recoveryActions("PROVISIONAL_QUALIFIED", eligible)).toEqual({ expire: false, finalizeUnresolved: false, close: false });
    expect(recoveryActions("OPEN", null)).toEqual({ expire: false, finalizeUnresolved: false, close: false });
  });
});
