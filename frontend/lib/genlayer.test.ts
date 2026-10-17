import { describe, expect, it, vi } from "vitest";
import { formatGen, matchesCreatedProgram, parseGen, requireDeployment, FINALITY_POLL_INTERVAL_MS, FINALITY_POLL_RETRIES, submissionErrorMessage, submitPreparedWrite } from "./genlayer";
import { normalizedChainId, TARGET_CHAIN_NUMBER } from "./network";
import { recoveryActions } from "./capabilities";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

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

describe("finalized program draft readback", () => {
  it("recognizes the exact unfunded draft by its frozen budget", () => {
    const program = {
      funder: "0xD6423aE82a975d55C6CeaC222827A727325e0459",
      recipient: "0x39680bd423437C0Eaa18493629652821Ec672C61",
      title: "Ascende frontend live verification",
      budget_wei: "2",
      status: "DRAFT",
    };
    expect(matchesCreatedProgram(program, {
      funder: program.funder.toLowerCase(), recipient: program.recipient, title: program.title, budgetWei: 2n,
    })).toBe(true);
    expect(matchesCreatedProgram(program, {
      funder: program.funder, recipient: program.recipient, title: program.title, budgetWei: 3n,
    })).toBe(false);
    expect(matchesCreatedProgram({ ...program, status: "ACTIVE" }, {
      funder: program.funder, recipient: program.recipient, title: program.title, budgetWei: 2n,
    })).toBe(false);
    expect(matchesCreatedProgram(null, {
      funder: program.funder, recipient: program.recipient, title: program.title, budgetWei: 2n,
    })).toBe(false);
  });
});

describe("transaction finality handling", () => {
  it("polls beyond the SDK's short default window and reports an ambiguous timeout as pending", async () => {
    const account = "0x1111111111111111111111111111111111111111";
    const hash = `0x${"a".repeat(64)}` as `0x${string}`;
    const provider = { request: vi.fn(async ({ method }: { method: string }) => method === "eth_chainId" ? "0xf22f" : [account]) };
    const waitForTransactionReceipt = vi.fn(async () => ({ txExecutionResultName: ExecutionResult.FINISHED_WITH_RETURN }));
    const client = { writeContract: vi.fn(async () => hash), waitForTransactionReceipt };
    const prepared = { account, provider, client, call: {}, simulated: true } as never;
    const onHash = vi.fn();

    const result = await submitPreparedWrite(prepared, onHash);

    expect(result.successful).toBe(true);
    expect(onHash).toHaveBeenCalledWith(hash);
    expect(waitForTransactionReceipt).toHaveBeenCalledWith({
      hash, status: TransactionStatus.FINALIZED,
      interval: FINALITY_POLL_INTERVAL_MS, retries: FINALITY_POLL_RETRIES,
    });
    expect(FINALITY_POLL_INTERVAL_MS * FINALITY_POLL_RETRIES).toBeGreaterThanOrEqual(240_000);
    const message = submissionErrorMessage(new Error(`Timed out waiting for transaction ${hash} to reach status "FINALIZED"`));
    expect(message).toMatch(/may still finalize/i);
    expect(message).toMatch(/do not submit another create/i);
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
