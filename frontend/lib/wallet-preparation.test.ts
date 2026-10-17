import { describe, expect, it, vi } from "vitest";

describe("selected injected wallet transaction preparation", () => {
  it("uses the selected provider without depending on window.ethereum", async () => {
    const contract = "0x2c7a6260f2958C0Bd6634182E9978d209F0a06aD";
    vi.stubEnv("NEXT_PUBLIC_ASCENDE_CONTRACT_ADDRESS", contract);
    vi.resetModules();

    const { prepareWrite } = await import("./genlayer");
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_chainId") return "0xf22f";
      throw new Error(`Unexpected wallet method: ${method}`);
    });
    const provider = { request };

    const prepared = await prepareWrite("0x0000000000000000000000000000000000000001", provider, {
      functionName: "create_program",
      args: ["recipient", "title", "purpose", "[]", "{}"],
      value: 2n,
    });

    expect(prepared.provider).toBe(provider);
    expect(prepared.call.address).toBe(contract);
    expect(prepared.call.value).toBe(2n);
    expect(prepared.simulated).toBe(false);
    expect(request).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
  });
});
