export const TARGET_CHAIN_ID = "0xf22f";
export const TARGET_CHAIN_NUMBER = 61999;
export const GENLAYER_RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC || "https://studio.genlayer.com/api";
export const EXPLORER = "https://explorer-studio.genlayer.com";
export function shortAddress(address: string) {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}
export function normalizedChainId(value: unknown): string {
  if (typeof value !== "string") return "";
  try { return `0x${BigInt(value).toString(16)}`; } catch { return ""; }
}
export type InjectedProvider = {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?: (name: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (name: string, listener: (...args: unknown[]) => void) => void;
};
declare global { interface Window { ethereum?: InjectedProvider } }
